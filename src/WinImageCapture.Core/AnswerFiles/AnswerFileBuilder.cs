using System.Xml.Linq;
using WinImageCapture.Core.Models;

namespace WinImageCapture.Core.AnswerFiles;

/// <summary>
/// Builds a Windows Setup unattended-installation answer file (unattend.xml) that follows
/// the "urn:schemas-microsoft-com:unattend" schema used by Windows Setup, sysprep, and DISM.
/// </summary>
public static class AnswerFileBuilder
{
    private static readonly XNamespace Unattend = "urn:schemas-microsoft-com:unattend";
    private static readonly XNamespace Wcm = "http://schemas.microsoft.com/WMIConfig/2002/State";
    private const string PublicKeyToken = "31bf3856ad364e35";

    public static IReadOnlyList<string> Validate(AnswerFileOptions options)
    {
        var errors = new List<string>();

        if (options.ComputerName != "*" && options.ComputerName.Length is 0 or > 15)
        {
            errors.Add("ComputerName must be '*' or 1-15 characters.");
        }

        if (options.AutoLogon && string.IsNullOrEmpty(options.AdministratorPassword) && options.LocalAccounts.Count == 0)
        {
            errors.Add("AutoLogon requires either an administrator password or at least one local account.");
        }

        foreach (var account in options.LocalAccounts)
        {
            if (string.IsNullOrWhiteSpace(account.Name))
            {
                errors.Add("Local account Name cannot be empty.");
            }
        }

        if (options.DomainJoin is { } join && string.IsNullOrWhiteSpace(join.DomainName))
        {
            errors.Add("DomainJoin.DomainName cannot be empty.");
        }

        return errors;
    }

    public static XDocument Build(AnswerFileOptions options)
    {
        var errors = Validate(options);
        if (errors.Count > 0)
        {
            throw new AnswerFileValidationException(errors);
        }

        var document = new XDocument(
            new XDeclaration("1.0", "utf-8", null),
            new XElement(
                Unattend + "unattend",
                new XAttribute(XNamespace.Xmlns + "wcm", Wcm.NamespaceName),
                BuildWindowsPeSettings(options),
                BuildSpecializeSettings(options),
                BuildOobeSystemSettings(options)));

        return document;
    }

    public static string BuildXmlString(AnswerFileOptions options)
    {
        var document = Build(options);
        using var writer = new StringWriter();
        document.Save(writer);
        return writer.ToString();
    }

    private static string Bool(bool value) => value ? "true" : "false";

    private static XElement Component(string name, params object?[] content) =>
        new(
            Unattend + "component",
            new XAttribute("name", name),
            new XAttribute("processorArchitecture", "amd64"),
            new XAttribute("publicKeyToken", PublicKeyToken),
            new XAttribute("language", "neutral"),
            new XAttribute("versionScope", "nonSxS"),
            content);

    private static XElement BuildWindowsPeSettings(AnswerFileOptions options)
    {
        var userDataContent = new List<object> { new XElement(Unattend + "AcceptEula", Bool(options.AcceptEula)) };

        if (!string.IsNullOrWhiteSpace(options.ProductKey))
        {
            userDataContent.Insert(
                0,
                new XElement(
                    Unattend + "ProductKey",
                    new XElement(Unattend + "Key", options.ProductKey),
                    new XElement(Unattend + "WillShowUI", "OnError")));
        }

        if (!string.IsNullOrWhiteSpace(options.Owner))
        {
            userDataContent.Add(new XElement(Unattend + "FullName", options.Owner));
        }

        if (!string.IsNullOrWhiteSpace(options.Organization))
        {
            userDataContent.Add(new XElement(Unattend + "Organization", options.Organization));
        }

        return new XElement(
            Unattend + "settings",
            new XAttribute("pass", "windowsPE"),
            Component(
                "Microsoft-Windows-International-Core-WinPE",
                new XElement(Unattend + "SetupUILanguage", new XElement(Unattend + "UILanguage", options.UILanguage)),
                new XElement(Unattend + "InputLocale", options.InputLocale),
                new XElement(Unattend + "SystemLocale", options.SystemLocale),
                new XElement(Unattend + "UILanguage", options.UILanguage),
                new XElement(Unattend + "UserLocale", options.UserLocale)),
            Component("Microsoft-Windows-Setup", new XElement(Unattend + "UserData", userDataContent.ToArray())));
    }

    private static XElement BuildSpecializeSettings(AnswerFileOptions options)
    {
        var shellSetupContent = new List<object>
        {
            new XElement(Unattend + "ComputerName", options.ComputerName),
            new XElement(Unattend + "TimeZone", options.TimeZone),
        };

        if (!string.IsNullOrWhiteSpace(options.Organization))
        {
            shellSetupContent.Add(new XElement(Unattend + "RegisteredOrganization", options.Organization));
        }

        if (!string.IsNullOrWhiteSpace(options.Owner))
        {
            shellSetupContent.Add(new XElement(Unattend + "RegisteredOwner", options.Owner));
        }

        var components = new List<XElement> { Component("Microsoft-Windows-Shell-Setup", shellSetupContent.ToArray()) };

        if (options.DomainJoin is { } join)
        {
            var credentialsContent = new List<object>
            {
                new XElement(Unattend + "Domain", join.DomainName),
                new XElement(Unattend + "Password", join.AccountPassword),
                new XElement(Unattend + "Username", join.AccountUsername),
            };

            var identificationContent = new List<object>
            {
                new XElement(Unattend + "Credentials", credentialsContent),
                new XElement(Unattend + "JoinDomain", join.DomainName),
            };

            if (!string.IsNullOrWhiteSpace(join.MachineObjectOU))
            {
                identificationContent.Add(new XElement(Unattend + "MachineObjectOU", join.MachineObjectOU));
            }

            components.Add(Component("Microsoft-Windows-UnattendedJoin", new XElement(Unattend + "Identification", identificationContent.ToArray())));
        }

        return new XElement(Unattend + "settings", new XAttribute("pass", "specialize"), components);
    }

    private static XElement BuildOobeSystemSettings(AnswerFileOptions options)
    {
        var oobeContent = new List<object>
        {
            new XElement(Unattend + "HideEULAPage", Bool(options.HideEulaPage)),
            new XElement(Unattend + "HideOnlineAccountScreens", Bool(options.HideOnlineAccountScreens)),
            new XElement(Unattend + "HideWirelessSetupInOOBE", Bool(options.HideWirelessSetupInOobe)),
            new XElement(Unattend + "NetworkLocation", options.NetworkLocation ? "Work" : "Other"),
            new XElement(Unattend + "ProtectYourPC", 1),
            new XElement(Unattend + "SkipMachineOOBE", Bool(options.SkipMachineOobe)),
            new XElement(Unattend + "SkipUserOOBE", Bool(options.SkipUserOobe)),
        };

        var shellSetupContent = new List<object> { new XElement(Unattend + "OOBE", oobeContent) };

        if (!string.IsNullOrEmpty(options.AdministratorPassword))
        {
            shellSetupContent.Add(new XElement(Unattend + "UserAccounts", BuildAdministratorPassword(options), BuildLocalAccounts(options)));
        }
        else if (options.LocalAccounts.Count > 0)
        {
            shellSetupContent.Add(new XElement(Unattend + "UserAccounts", BuildLocalAccounts(options)));
        }

        if (options.AutoLogon)
        {
            var autoLogonUsername = options.LocalAccounts.Count > 0 ? options.LocalAccounts[0].Name : "Administrator";
            var autoLogonPassword = options.LocalAccounts.Count > 0 ? options.LocalAccounts[0].Password : options.AdministratorPassword ?? string.Empty;

            shellSetupContent.Add(
                new XElement(
                    Unattend + "AutoLogon",
                    new XElement(Unattend + "Password", new XElement(Unattend + "Value", autoLogonPassword), new XElement(Unattend + "PlainText", Bool(true))),
                    new XElement(Unattend + "Enabled", Bool(true)),
                    new XElement(Unattend + "LogonCount", options.AutoLogonCount),
                    new XElement(Unattend + "Username", autoLogonUsername)));
        }

        if (options.FirstLogonCommands.Count > 0)
        {
            var commands = options.FirstLogonCommands.Select(
                (command, index) => new XElement(
                    Unattend + "SynchronousCommand",
                    new XAttribute(Wcm + "action", "add"),
                    new XElement(Unattend + "Order", index + 1),
                    new XElement(Unattend + "CommandLine", command)));

            shellSetupContent.Add(new XElement(Unattend + "FirstLogonCommands", commands));
        }

        return new XElement(Unattend + "settings", new XAttribute("pass", "oobeSystem"), Component("Microsoft-Windows-Shell-Setup", shellSetupContent.ToArray()));
    }

    private static XElement BuildAdministratorPassword(AnswerFileOptions options) =>
        new(
            Unattend + "AdministratorPassword",
            new XElement(Unattend + "Value", options.AdministratorPassword),
            new XElement(Unattend + "PlainText", Bool(options.AdministratorPasswordPlainText)));

    private static XElement BuildLocalAccounts(AnswerFileOptions options)
    {
        var accounts = options.LocalAccounts.Select(
            account => new XElement(
                Unattend + "LocalAccount",
                new XAttribute(Wcm + "action", "add"),
                new XElement(Unattend + "Password", new XElement(Unattend + "Value", account.Password), new XElement(Unattend + "PlainText", Bool(true))),
                new XElement(Unattend + "Group", account.Group),
                new XElement(Unattend + "DisplayName", account.DisplayName),
                new XElement(Unattend + "Name", account.Name)));

        return new XElement(Unattend + "LocalAccounts", accounts);
    }
}
