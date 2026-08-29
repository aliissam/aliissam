namespace WinImageCapture.App.Services;

public static class DismLocator
{
    /// <summary>Resolves the full path to the OS-supplied dism.exe, falling back to PATH lookup.</summary>
    public static string ResolveExecutablePath()
    {
        var windowsDirectory = Environment.GetEnvironmentVariable("WINDIR") ?? Environment.GetEnvironmentVariable("SystemRoot");
        if (!string.IsNullOrEmpty(windowsDirectory))
        {
            var candidate = Path.Combine(windowsDirectory, "System32", "Dism", "dism.exe");
            if (File.Exists(candidate))
            {
                return candidate;
            }
        }

        return "dism.exe";
    }
}
