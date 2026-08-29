# WinImageCapture

A Windows desktop tool for capturing a reference machine into a deployable
Windows image (`.wim`) and attaching an unattended-setup answer file
(`unattend.xml`) so the image installs without manual prompts — the same
two building blocks Acronis-style imaging tools and Microsoft's own
deployment stack (MDT/WDS/DISM) are built on, packaged as a single app.

## How it works

Rather than reimplementing disk imaging, the app drives the imaging engine
already built into Windows: **DISM** (`dism.exe`). This is deliberate —
sector-level imaging (true Acronis-style raw disk capture with VSS
snapshots and a bootable recovery environment) is a multi-month, much
higher-risk undertaking. DISM-based WIM capture is well documented,
already handles the hard parts (open-file/in-use-file capture via
Volume Shadow Copy, NTFS security descriptors, hard links, compression),
and is what the "capture a golden image, then answer-file deploy it"
workflow is actually built on in real deployments.

- **Capture** — `dism.exe /Capture-Image` turns a folder or mounted
  volume into a `.wim`.
- **Answer file** — `AnswerFileBuilder` (Core) generates a schema-correct
  `unattend.xml` (`urn:schemas-microsoft-com:unattend`) from a typed
  options object: computer name, product key, local accounts/admin
  password, auto-logon, OOBE skip flags, domain join, first-logon
  commands.
- **Injection** — `dism.exe /Mount-Image`, drop the answer file into
  `Windows\Panther\unattend.xml` (and `Windows\System32\Sysprep\` when
  present) inside the offline image, then `/Unmount-Image /Commit`. This
  is where Windows Setup and sysprep look for it on first boot.
- **Apply/Deploy** — `dism.exe /Apply-Image` restores the `.wim` onto a
  target volume.

Every DISM argument list is built by a pure, unit-tested function
(`DismArgumentBuilder`) using `ProcessStartInfo.ArgumentList` (not
hand-quoted command-line strings), so paths and names with spaces are
passed safely.

## Project layout

```
WinImageCapture.sln
src/
  WinImageCapture.Core/          Cross-platform, dependency-light library:
                                  answer-file XML generation, DISM argument
                                  building, progress parsing, process
                                  orchestration. No WPF/Windows dependency —
                                  testable on any OS.
  WinImageCapture.Core.Tests/    xUnit tests for the above.
  WinImageCapture.App/           WPF (net8.0-windows) MVVM UI: Capture,
                                  Answer File, and Apply/Deploy tabs, plus
                                  a live log panel. Runs elevated
                                  (requireAdministrator) since DISM needs it.
installer/setup.iss              Inno Setup script producing a signed(-able)
                                  installer.
.github/workflows/build.yml      CI: restore, build, test, publish on
                                  windows-latest.
```

## Building and running

Requires the .NET 8 SDK **on Windows** (the WPF app targets
`net8.0-windows` and cannot build or run on Linux/macOS).

```powershell
dotnet restore WinImageCapture.sln
dotnet build WinImageCapture.sln -c Release
dotnet test src\WinImageCapture.Core.Tests\WinImageCapture.Core.Tests.csproj
dotnet run --project src\WinImageCapture.App
```

The app must run elevated — the manifest requests
`requireAdministrator`, so Windows will prompt for elevation on launch.
Without it, every DISM call fails immediately (the UI shows a warning
banner if it detects it isn't elevated).

## Building the installer

```powershell
dotnet publish src\WinImageCapture.App\WinImageCapture.App.csproj -c Release -r win-x64 --self-contained false -o publish\WinImageCapture
iscc installer\setup.iss
```

Producing a genuinely "production" installer also requires a
**code-signing certificate** — an unsigned `.exe`/installer will trigger
SmartScreen warnings for every user who downloads it. `installer/setup.iss`
has the signing hook commented in; wire up your certificate there (or
sign `WinImageCapture.exe` with `signtool` before packaging).

## What was and wasn't verified in this session

This was built in a Linux container with no Windows host and no network
access to the .NET SDK download, so:

- **Not verified**: the WPF app (`WinImageCapture.App`) was not compiled —
  `net8.0-windows`/WPF cannot build outside Windows. Review the XAML/C#
  for typos before your first build; I was not able to run `dotnet build`
  against it.
- **Not verified**: end-to-end DISM behavior (capture/apply/mount/inject)
  requires a real Windows machine, admin rights, and a source to capture —
  none of which exist in this environment.
- **Verified by code review, not compilation**: `WinImageCapture.Core` and
  its tests are plain, cross-platform C#/xUnit and *should* build and pass
  with `dotnet test` on Windows, but I could not install the .NET SDK here
  to actually run them (outbound access to the SDK CDN was blocked by this
  session's network policy).

**Before treating this as done**, on a Windows machine run:
`dotnet build WinImageCapture.sln` and `dotnet test`, then launch the app
elevated and walk through Capture → Answer File → Apply against a test
folder/VM.

## Roadmap ideas (not built yet)

- Sector-level/raw disk imaging (true Acronis-style, works on the running
  OS volume) — needs a bootable WinPE recovery environment; a much larger
  project, scope this separately if you need it.
- Auto-update and license/activation for a sellable product.
- A richer local-accounts editor (the UI currently supports one local
  account; `AnswerFileOptions.LocalAccounts` already supports many — the
  view model just needs a list-editing UI on top of it).
- Driver injection (`/Add-Driver`) and package injection (`/Add-Package`)
  into the mounted image before commit, for hardware-specific golden
  images.
