namespace WinImageCapture.Core.Imaging;

public interface IProcessRunner
{
    Task<ProcessRunResult> RunAsync(
        string fileName,
        IReadOnlyList<string> arguments,
        IProgress<string>? outputLine,
        CancellationToken cancellationToken);
}

public sealed record ProcessRunResult(int ExitCode, string StandardOutput, string StandardError);
