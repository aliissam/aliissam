using System.Windows;
using Microsoft.Win32;
using WinImageCapture.Core.Imaging;
using WinImageCapture.Core.Models;

namespace WinImageCapture.App.ViewModels;

public sealed class ApplyViewModel : ViewModelBase
{
    private readonly ImagingService _imagingService;
    private readonly Action<string> _log;

    private string _sourceWimPath = string.Empty;
    private int _imageIndex = 1;
    private string _targetDirectory = string.Empty;
    private double? _percentComplete;
    private string _statusMessage = "Ready.";
    private bool _isBusy;

    public ApplyViewModel(ImagingService imagingService, Action<string> log)
    {
        _imagingService = imagingService;
        _log = log;
        BrowseSourceCommand = new RelayCommand(BrowseSourceAsync);
        BrowseTargetCommand = new RelayCommand(BrowseTargetAsync);
        ApplyCommand = new RelayCommand(ApplyAsync, () => !IsBusy && CanApply());
    }

    public string SourceWimPath { get => _sourceWimPath; set => SetField(ref _sourceWimPath, value); }

    public int ImageIndex { get => _imageIndex; set => SetField(ref _imageIndex, value); }

    public string TargetDirectory { get => _targetDirectory; set => SetField(ref _targetDirectory, value); }

    public double? PercentComplete { get => _percentComplete; private set => SetField(ref _percentComplete, value); }

    public string StatusMessage { get => _statusMessage; private set => SetField(ref _statusMessage, value); }

    public bool IsBusy { get => _isBusy; private set => SetField(ref _isBusy, value); }

    public RelayCommand BrowseSourceCommand { get; }

    public RelayCommand BrowseTargetCommand { get; }

    public RelayCommand ApplyCommand { get; }

    private bool CanApply() =>
        !string.IsNullOrWhiteSpace(SourceWimPath) &&
        !string.IsNullOrWhiteSpace(TargetDirectory) &&
        ImageIndex > 0;

    private Task BrowseSourceAsync()
    {
        var dialog = new OpenFileDialog
        {
            Title = "Select the image to apply",
            Filter = "Windows Image (*.wim)|*.wim",
        };
        if (dialog.ShowDialog() == true)
        {
            SourceWimPath = dialog.FileName;
        }

        return Task.CompletedTask;
    }

    private Task BrowseTargetAsync()
    {
        var dialog = new OpenFolderDialog { Title = "Select the target drive or folder" };
        if (dialog.ShowDialog() == true)
        {
            TargetDirectory = dialog.FolderName;
        }

        return Task.CompletedTask;
    }

    private async Task ApplyAsync()
    {
        IsBusy = true;
        StatusMessage = "Applying image...";
        PercentComplete = 0;
        _log($"Starting apply of '{SourceWimPath}' (index {ImageIndex}) -> '{TargetDirectory}'");

        try
        {
            var options = new ApplyOptions
            {
                SourceWimPath = SourceWimPath,
                ImageIndex = ImageIndex,
                TargetDirectory = TargetDirectory,
            };

            var progress = new Progress<OperationProgress>(p =>
            {
                PercentComplete = p.PercentComplete;
                if (p.Message is not null)
                {
                    _log(p.Message);
                }
            });

            await _imagingService.ApplyAsync(options, progress, CancellationToken.None);
            StatusMessage = "Apply completed successfully.";
            _log(StatusMessage);
        }
        catch (Exception ex)
        {
            StatusMessage = $"Apply failed: {ex.Message}";
            _log(StatusMessage);
            MessageBox.Show(ex.Message, "Apply failed", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsBusy = false;
        }
    }
}
