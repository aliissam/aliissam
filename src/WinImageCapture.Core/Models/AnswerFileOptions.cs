namespace WinImageCapture.Core.Models;

/// <summary>
/// Settings used to generate a Windows unattended-setup answer file (unattend.xml).
/// </summary>
public sealed class AnswerFileOptions
{
    public string ComputerName { get; set; } = "*";
    public string Organization { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string TimeZone { get; set; } = "UTC";
    public string InputLocale { get; set; } = "en-US";
    public string SystemLocale { get; set; } = "en-US";
    public string UILanguage { get; set; } = "en-US";
    public string UserLocale { get; set; } = "en-US";

    public bool HideEulaPage { get; set; } = true;
    public bool HideOnlineAccountScreens { get; set; } = true;
    public bool HideWirelessSetupInOobe { get; set; } = true;
    public bool NetworkLocation { get; set; } = true;
    public bool SkipMachineOobe { get; set; } = true;
    public bool SkipUserOobe { get; set; } = true;

    public string? ProductKey { get; set; }
    public bool AcceptEula { get; set; } = true;

    public string? AdministratorPassword { get; set; }
    public bool AdministratorPasswordPlainText { get; set; } = true;
    public bool AutoLogon { get; set; }
    public int AutoLogonCount { get; set; } = 1;

    public List<LocalAccount> LocalAccounts { get; } = new();
    public List<string> FirstLogonCommands { get; } = new();

    public DomainJoinOptions? DomainJoin { get; set; }
}

public sealed class LocalAccount
{
    public required string Name { get; init; }
    public required string Password { get; init; }
    public string Group { get; init; } = "Administrators";
    public string DisplayName { get; init; } = string.Empty;
}

public sealed class DomainJoinOptions
{
    public required string DomainName { get; init; }
    public required string AccountUsername { get; init; }
    public required string AccountPassword { get; init; }
    public string? MachineObjectOU { get; init; }
}
