using WinImageCapture.Core.Models;

namespace WinImageCapture.Core.Imaging;

/// <summary>
/// Pure argument-list builders for dism.exe invocations. Kept side-effect free and Windows-independent
/// so the argument shape can be unit tested without a Windows host or an actual dism.exe binary.
/// </summary>
public static class DismArgumentBuilder
{
    public static IReadOnlyList<string> Capture(CaptureOptions options)
    {
        var args = new List<string>
        {
            "/Capture-Image",
            $"/ImageFile:{options.DestinationWimPath}",
            $"/CaptureDir:{options.SourceDirectory}",
            $"/Name:{options.ImageName}",
        };

        if (!string.IsNullOrWhiteSpace(options.ImageDescription))
        {
            args.Add($"/Description:{options.ImageDescription}");
        }

        args.Add($"/Compress:{CompressionArg(options.Compression)}");

        if (options.CheckIntegrity)
        {
            args.Add("/CheckIntegrity");
        }

        return args;
    }

    public static IReadOnlyList<string> Apply(ApplyOptions options) => new[]
    {
        "/Apply-Image",
        $"/ImageFile:{options.SourceWimPath}",
        $"/Index:{options.ImageIndex}",
        $"/ApplyDir:{options.TargetDirectory}",
    };

    public static IReadOnlyList<string> MountImage(string wimPath, int index, string mountDir) => new[]
    {
        "/Mount-Image",
        $"/ImageFile:{wimPath}",
        $"/Index:{index}",
        $"/MountDir:{mountDir}",
    };

    public static IReadOnlyList<string> UnmountCommit(string mountDir) => new[]
    {
        "/Unmount-Image",
        $"/MountDir:{mountDir}",
        "/Commit",
    };

    public static IReadOnlyList<string> UnmountDiscard(string mountDir) => new[]
    {
        "/Unmount-Image",
        $"/MountDir:{mountDir}",
        "/Discard",
    };

    private static string CompressionArg(CompressionLevel level) => level switch
    {
        CompressionLevel.None => "none",
        CompressionLevel.Fast => "fast",
        CompressionLevel.Max => "max",
        CompressionLevel.Recovery => "recovery",
        _ => "fast",
    };
}
