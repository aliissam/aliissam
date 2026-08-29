using WinImageCapture.Core.Models;

namespace WinImageCapture.Core.Imaging;

/// <summary>
/// Orchestrates dism.exe-backed capture, apply, and answer-file injection operations.
/// Requires the calling process to be elevated (Administrator) on Windows.
/// </summary>
public sealed class ImagingService
{
    private const string DefaultDismExecutable = "dism.exe";

    private readonly IProcessRunner _processRunner;
    private readonly string _dismExecutable;

    public ImagingService(IProcessRunner processRunner, string? dismExecutablePath = null)
    {
        _processRunner = processRunner;
        _dismExecutable = dismExecutablePath ?? DefaultDismExecutable;
    }

    public Task CaptureAsync(CaptureOptions options, IProgress<OperationProgress>? progress, CancellationToken cancellationToken) =>
        RunDismAsync(DismArgumentBuilder.Capture(options), "Capturing image", progress, cancellationToken);

    public Task ApplyAsync(ApplyOptions options, IProgress<OperationProgress>? progress, CancellationToken cancellationToken) =>
        RunDismAsync(DismArgumentBuilder.Apply(options), "Applying image", progress, cancellationToken);

    /// <summary>
    /// Mounts the given WIM, drops the answer file into the offline image's Panther and
    /// Sysprep folders (the locations Windows Setup and sysprep look for it on first boot),
    /// then commits the change back into the WIM.
    /// </summary>
    public async Task InjectAnswerFileAsync(
        string wimPath,
        int imageIndex,
        string answerFileContent,
        IProgress<OperationProgress>? progress,
        CancellationToken cancellationToken)
    {
        var mountDir = Path.Combine(Path.GetTempPath(), "WinImageCapture", "mount-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(mountDir);

        try
        {
            await RunDismAsync(DismArgumentBuilder.MountImage(wimPath, imageIndex, mountDir), "Mounting image", progress, cancellationToken).ConfigureAwait(false);

            var pantherDir = Path.Combine(mountDir, "Windows", "Panther");
            Directory.CreateDirectory(pantherDir);
            var unattendPath = Path.Combine(pantherDir, "unattend.xml");
            await File.WriteAllTextAsync(unattendPath, answerFileContent, cancellationToken).ConfigureAwait(false);

            var sysprepDir = Path.Combine(mountDir, "Windows", "System32", "Sysprep");
            if (Directory.Exists(sysprepDir))
            {
                File.Copy(unattendPath, Path.Combine(sysprepDir, "unattend.xml"), overwrite: true);
            }

            progress?.Report(new OperationProgress("Committing changes", null));
            await RunDismAsync(DismArgumentBuilder.UnmountCommit(mountDir), "Committing image", progress, cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            try
            {
                await RunDismAsync(DismArgumentBuilder.UnmountDiscard(mountDir), "Discarding mount", null, CancellationToken.None).ConfigureAwait(false);
            }
            catch
            {
                // Best-effort cleanup; the original exception is what the caller needs to see.
            }

            throw;
        }
        finally
        {
            try
            {
                if (Directory.Exists(mountDir))
                {
                    Directory.Delete(mountDir, recursive: true);
                }
            }
            catch (IOException)
            {
                // The mount directory may still be held by DISM; safe to leave behind.
            }
        }
    }

    private async Task RunDismAsync(
        IReadOnlyList<string> arguments,
        string stageName,
        IProgress<OperationProgress>? progress,
        CancellationToken cancellationToken)
    {
        var lineProgress = new Progress<string>(line =>
        {
            var percent = DismProgressParser.TryParsePercent(line);
            progress?.Report(new OperationProgress(stageName, percent, line));
        });

        var result = await _processRunner.RunAsync(_dismExecutable, arguments, lineProgress, cancellationToken).ConfigureAwait(false);

        if (result.ExitCode != 0)
        {
            throw new DismException($"{stageName} failed with exit code {result.ExitCode}.", result.ExitCode, result.StandardError);
        }
    }
}
