using System.Xml.Linq;
using WinImageCapture.Core.AnswerFiles;
using WinImageCapture.Core.Models;
using Xunit;

namespace WinImageCapture.Core.Tests;

public class AnswerFileBuilderTests
{
    private static readonly XNamespace Unattend = "urn:schemas-microsoft-com:unattend";

    [Fact]
    public void Build_ProducesRootWithThreePasses()
    {
        var options = new AnswerFileOptions { ComputerName = "TEST-PC" };

        var document = AnswerFileBuilder.Build(options);

        Assert.Equal(Unattend + "unattend", document.Root!.Name);
        Assert.Equal(3, document.Root.Elements(Unattend + "settings").Count());
    }

    [Fact]
    public void Build_RejectsComputerNameLongerThan15Characters()
    {
        var options = new AnswerFileOptions { ComputerName = new string('A', 16) };

        Assert.Throws<AnswerFileValidationException>(() => AnswerFileBuilder.Build(options));
    }

    [Fact]
    public void Build_AllowsWildcardComputerName()
    {
        var options = new AnswerFileOptions { ComputerName = "*" };

        var document = AnswerFileBuilder.Build(options);

        Assert.NotNull(document.Root);
    }

    [Fact]
    public void Build_IncludesLocalAccountsWhenProvided()
    {
        var options = new AnswerFileOptions { ComputerName = "TEST-PC" };
        options.LocalAccounts.Add(new LocalAccount { Name = "tech", Password = "P@ss1", Group = "Administrators" });

        var xml = AnswerFileBuilder.BuildXmlString(options);

        Assert.Contains("<Name>tech</Name>", xml);
        Assert.Contains("Administrators", xml);
    }

    [Fact]
    public void Build_UsesLowercaseBooleanLiterals()
    {
        var options = new AnswerFileOptions { ComputerName = "TEST-PC", HideEulaPage = true };

        var xml = AnswerFileBuilder.BuildXmlString(options);

        Assert.Contains("<HideEULAPage>true</HideEULAPage>", xml);
        Assert.DoesNotContain("True", xml);
        Assert.DoesNotContain("False", xml);
    }

    [Fact]
    public void Build_IncludesDomainJoinWhenConfigured()
    {
        var options = new AnswerFileOptions
        {
            ComputerName = "TEST-PC",
            DomainJoin = new DomainJoinOptions
            {
                DomainName = "contoso.com",
                AccountUsername = "joiner",
                AccountPassword = "P@ss1",
            },
        };

        var xml = AnswerFileBuilder.BuildXmlString(options);

        Assert.Contains("Microsoft-Windows-UnattendedJoin", xml);
        Assert.Contains("<JoinDomain>contoso.com</JoinDomain>", xml);
    }

    [Fact]
    public void Build_RejectsAutoLogonWithoutAnyCredential()
    {
        var options = new AnswerFileOptions { ComputerName = "TEST-PC", AutoLogon = true };

        var ex = Assert.Throws<AnswerFileValidationException>(() => AnswerFileBuilder.Build(options));
        Assert.Contains(ex.Errors, e => e.Contains("AutoLogon"));
    }

    [Fact]
    public void Build_IncludesFirstLogonCommandsInOrder()
    {
        var options = new AnswerFileOptions { ComputerName = "TEST-PC" };
        options.FirstLogonCommands.Add("cmd /c echo first");
        options.FirstLogonCommands.Add("cmd /c echo second");

        var document = AnswerFileBuilder.Build(options);
        var orders = document.Descendants(Unattend + "Order").Select(e => e.Value).ToList();

        Assert.Equal(new[] { "1", "2" }, orders);
    }
}
