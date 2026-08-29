; WinImageCapture installer script (Inno Setup 6).
;
; Prerequisites:
;   1. Publish the app first:
;      dotnet publish src\WinImageCapture.App\WinImageCapture.App.csproj -c Release -r win-x64 --self-contained false -o publish\WinImageCapture
;   2. Install Inno Setup: https://jrsoftware.org/isinfo.php
;   3. Build the installer:
;      iscc installer\setup.iss
;
; Code signing (required for a trustworthy "production" install):
;   Obtain a code-signing certificate (EV or OV) from a CA, then either:
;     a) sign WinImageCapture.exe with signtool BEFORE running iscc, and/or
;     b) uncomment the SignTool line below and configure it in the Inno Setup IDE
;        (Tools > Configure Sign Tools) so the generated setup.exe itself is signed.
;   Unsigned installers will trigger SmartScreen warnings on end-user machines.

#define MyAppName "WinImageCapture"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Your Company"
#define MyAppExeName "WinImageCapture.exe"

[Setup]
AppId={{B9B6E9C6-6F0B-4E1E-9B7E-6E6E7B2E9A11}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputDir=..\dist
OutputBaseFilename=WinImageCaptureSetup-{#MyAppVersion}
Compression=lzma2
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
WizardStyle=modern
; SignTool=mysigntool

[Files]
Source: "..\publish\WinImageCapture\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional shortcuts:"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent
