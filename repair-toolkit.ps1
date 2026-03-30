Clear-Host
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   WINDOWS MAINTENANCE TOOLKIT" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan

function Show-Menu {
    Write-Host ""
    Write-Host "1. System Health Report"
    Write-Host "2. Clean Temp Files"
    Write-Host "3. Disk Cleanup"
    Write-Host "4. Clean Browser Cache"
    Write-Host "5. View Startup Programs"
    Write-Host "6. Reset Network"
    Write-Host "7. Check Windows Updates"
    Write-Host "0. Exit"
}

function System-Health {
    Write-Host "`n=== SYSTEM HEALTH ===" -ForegroundColor Green

    $cpu = Get-CimInstance Win32_Processor
    Write-Host "CPU Load:" $cpu.LoadPercentage "%"

    $os = Get-CimInstance Win32_OperatingSystem
    $usedMem = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory)/1MB,2)
    $totalMem = [math]::Round($os.TotalVisibleMemorySize/1MB,2)

    Write-Host "Memory Used: $usedMem GB / $totalMem GB"

    Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
    Select-Object DeviceID,
        @{Name="Free(GB)";Expression={[math]::Round($_.FreeSpace/1GB,2)}},
        @{Name="Total(GB)";Expression={[math]::Round($_.Size/1GB,2)}} |
    Format-Table
}

function Clean-Temp {
    Write-Host "`nCleaning Temp Files..." -ForegroundColor Yellow
    Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Temp files cleaned."
}

function Disk-Cleanup {
    Write-Host "`nRunning Disk Cleanup..." -ForegroundColor Yellow
    cleanmgr /sagerun:1
}

function Clean-Browsers {
    Write-Host "`nCleaning Browser Cache..." -ForegroundColor Yellow

    $paths = @(
        "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache",
        "$env:LOCALAPPDATA\Mozilla\Firefox\Profiles"
    )

    foreach ($path in $paths) {
        if (Test-Path $path) {
            Remove-Item "$path\*" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "Cleaned $path"
        }
    }
}

function Startup-Programs {
    Write-Host "`nStartup Programs:" -ForegroundColor Cyan
    Get-CimInstance Win32_StartupCommand |
    Select-Object Name, Command, Location |
    Format-Table
}

function Reset-Network {
    Write-Host "`nResetting Network..." -ForegroundColor Yellow
    ipconfig /flushdns
    netsh winsock reset
    Write-Host "Restart PC to complete reset."
}

function Check-Updates {
    Write-Host "`nOpening Windows Update..." -ForegroundColor Yellow
    start ms-settings:windowsupdate
}

do {
    Show-Menu
    $choice = Read-Host "Select an option"

    switch ($choice) {
        "1" { System-Health }
        "2" { Clean-Temp }
        "3" { Disk-Cleanup }
        "4" { Clean-Browsers }
        "5" { Startup-Programs }
        "6" { Reset-Network }
        "7" { Check-Updates }
        "0" { break }
        default { Write-Host "Invalid choice." }
    }

} while ($choice -ne "0")