using System.Windows;
using Microsoft.Win32;
using WinImageCapture.Core.Imaging;
using WinImageCapture.Core.Models;

namespace WinImageCapture.App.ViewModels;

public sealed class CaptureViewModel : ViewModelBase
{
    private readonly ImagingService _imagingService;
    private readonly Action<string> _log;

    private string _sourceDirectory = string.Empty;
    private string _destinationWimPath = string.Empty;
    private string _imageName = string.Empty;
    private string _imageDescription = string.Empty;
    private CompressionLevel _compression = CompressionLevel.Fast;
    private bool _checkIntegrity = true;
    private double? _percentComplete;
    private string _statusMessage = "Ready.";
    private bool _isBusy;

    public CaptureViewModel(ImagingService imagingService, Action<string> log)
    {
        _imagingService = imagingService;
        _log = log;
        BrowseSourceCommand = new RelayCommand(BrowseSourceAsync);
        BrowseDestinationCommand = new RelayCommand(BrowseDestinationAsync);
        CaptureCommand = new RelayCommand(CaptureAsync, () => !IsBusy && CanCapture());
    }

    public string SourceDirectory { get => _sourceDirectory; set => SetField(ref _sourceDirectory, value); }

    public string DestinationWimPath { get => _destinationWimPath; set => SetField(ref _destinationWimPath, value); }

    public string ImageName { get => _imageName; set => SetField(ref _imageName, value); }

    public string ImageDescription { get => _imageDescription; set => SetField(ref _imageDescription, value); }

    public CompressionLevel Compression { get => _compression; set => SetField(ref _compression, value); }

    public bool CheckIntegrity { get => _checkIntegrity; set => SetField(ref _checkIntegrity, value); }

    public double? PercentComplete { get => _percentComplete; private set => SetField(ref _percentComplete, value); }

    public string StatusMessage { get => _statusMessage; private set => SetField(ref _statusMessage, value); }

    public bool IsBusy { get => _isBusy; private set => SetField(ref _isBusy, value); }

    public IEnumerable<CompressionLevel> CompressionLevels { get; } = Enum.GetValues<CompressionLevel>();

    public RelayCommand BrowseSourceCommand { get; }

    public RelayCommand BrowseDestinationCommand { get; }

    public RelayCommand CaptureCommand { get; }

    private bool CanCapture() =>
        !string.IsNullOrWhiteSpace(SourceDirectory) &&
        !string.IsNullOrWhiteSpace(DestinationWimPath) &&
        !string.IsNullOrWhiteSpace(ImageName);

    private Task BrowseSourceAsync()
    {
        var dialog = new OpenFolderDialog { Title = "Select the folder or drive to capture" };
        if (dialog.ShowDialog() == true)
        {
            SourceDirectory = dialog.FolderName;
        }

        return Task.CompletedTask;
    }

    private Task BrowseDestinationAsync()
    {
        var dialog = new SaveFileDialog
        {
            Title = "Choose where to save the captured image",
            Filter = "Windows Image (*.wim)|*.wim",
            DefaultExt = ".wim",
        };
        if (dialog.ShowDialog() == true)
        {
            DestinationWimPath = dialog.FileName;
        }

        return Task.CompletedTask;
    }

    private async Task CaptureAsync()
    {
        IsBusy = true;
        StatusMessage = "Capturing image...";
        PercentComplete = 0;
        _log($"Starting capture of '{SourceDirectory}' -> '{DestinationWimPath}'");

        try
        {
            var options = new CaptureOptions
            {
                SourceDirectory = SourceDirectory,
                DestinationWimPath = DestinationWimPath,
                ImageName = ImageName,
                ImageDescription = string.IsNullOrWhiteSpace(ImageDescription) ? null : ImageDescription,
                Compression = Compression,
                CheckIntegrity = CheckIntegrity,
            };

            var progress = new Progress<OperationProgress>(p =>
            {
                PercentComplete = p.PercentComplete;
                if (p.Message is not null)
                {
                    _log(p.Message);
                }
            });

            await _imagingService.CaptureAsync(options, progress, CancellationToken.None);
            StatusMessage = "Capture completed successfully.";
            _log(StatusMessage);
        }
        catch (Exception ex)
        {
            StatusMessage = $"Capture failed: {ex.Message}";
            _log(StatusMessage);
            MessageBox.Show(ex.Message, "Capture failed", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsBusy = false;
        }
    }
}
