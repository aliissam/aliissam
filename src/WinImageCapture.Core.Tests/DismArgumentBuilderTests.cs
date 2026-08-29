using WinImageCapture.Core.Imaging;
using WinImageCapture.Core.Models;
using Xunit;

namespace WinImageCapture.Core.Tests;

public class DismArgumentBuilderTests
{
    [Fact]
    public void Capture_BuildsExpectedArguments()
    {
        var options = new CaptureOptions
        {
            SourceDirectory = @"C:\Reference",
            DestinationWimPath = @"D:\Images\golden.wim",
            ImageName = "Golden Image",
            ImageDescription = "Base build",
            Compression = CompressionLevel.Max,
            CheckIntegrity = true,
        };

        var args = DismArgumentBuilder.Capture(options);

        Assert.Contains("/Capture-Image", args);
        Assert.Contains(@"/ImageFile:D:\Images\golden.wim", args);
        Assert.Contains(@"/CaptureDir:C:\Reference", args);
        Assert.Contains("/Name:Golden Image", args);
        Assert.Contains("/Description:Base build", args);
        Assert.Contains("/Compress:max", args);
        Assert.Contains("/CheckIntegrity", args);
    }

    [Fact]
    public void Capture_OmitsOptionalFlagsWhenNotRequested()
    {
        var options = new CaptureOptions
        {
            SourceDirectory = @"C:\Reference",
            DestinationWimPath = @"D:\Images\golden.wim",
            ImageName = "Golden Image",
            CheckIntegrity = false,
        };

        var args = DismArgumentBuilder.Capture(options);

        Assert.DoesNotContain(args, a => a.StartsWith("/Description:"));
        Assert.DoesNotContain("/CheckIntegrity", args);
    }

    [Fact]
    public void Apply_BuildsExpectedArguments()
    {
        var options = new ApplyOptions
        {
            SourceWimPath = @"D:\Images\golden.wim",
            ImageIndex = 1,
            TargetDirectory = @"C:\",
        };

        var args = DismArgumentBuilder.Apply(options);

        Assert.Equal(
            new[] { "/Apply-Image", @"/ImageFile:D:\Images\golden.wim", "/Index:1", @"/ApplyDir:C:\" },
            args);
    }

    [Fact]
    public void MountImage_BuildsExpectedArguments()
    {
        var args = DismArgumentBuilder.MountImage(@"D:\golden.wim", 1, @"C:\Mount");

        Assert.Equal(
            new[] { "/Mount-Image", @"/ImageFile:D:\golden.wim", "/Index:1", @"/MountDir:C:\Mount" },
            args);
    }

    [Fact]
    public void UnmountCommit_BuildsExpectedArguments()
    {
        var args = DismArgumentBuilder.UnmountCommit(@"C:\Mount");

        Assert.Equal(new[] { "/Unmount-Image", @"/MountDir:C:\Mount", "/Commit" }, args);
    }
}
