# RoCrew in the system tray: runs the app with no windows, restarts it if it ever stops
# unexpectedly, and gives you Open / Quit from the tray icon. Started by "Start RoCrew.vbs".
$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
$openAtStart = -not ($args -contains 'nobrowser')
$script:quitting = $false
$script:node = $null

function Start-RoCrew([bool]$open) {
  $nodeArgs = @('studio\server.mjs')
  if ($open) { $nodeArgs += '--open' }
  $script:node = Start-Process -FilePath 'node' -ArgumentList $nodeArgs -WorkingDirectory $root -WindowStyle Hidden -PassThru
}
function Get-Runtime { Get-Content (Join-Path $root '.rocrew\runtime.json') -Raw | ConvertFrom-Json }

$icon = New-Object System.Windows.Forms.NotifyIcon
$icon.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon((Get-Command node).Source)
$icon.Text = 'RoCrew - your agent studio'
$icon.Visible = $true
$menu = New-Object System.Windows.Forms.ContextMenuStrip
$openItem = $menu.Items.Add('Open RoCrew')
$quitItem = $menu.Items.Add('Quit RoCrew')
$icon.ContextMenuStrip = $menu

$openApp = {
  $port = 4600
  try { $port = (Get-Runtime).port } catch {}
  $brave = @("$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe", "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe", "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($brave) { Start-Process $brave "--app=http://localhost:$port" }
  else { try { Start-Process 'msedge' "--app=http://localhost:$port" } catch { Start-Process "http://localhost:$port" } }
}
$openItem.add_Click($openApp)
$icon.add_DoubleClick($openApp)
$quitItem.add_Click({
  $script:quitting = $true
  try {
    $rt = Get-Runtime
    Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:$($rt.port)/api/quit" -Headers @{ 'x-rocrew-token' = $rt.token } -TimeoutSec 5 | Out-Null
  } catch {}
  Start-Sleep -Milliseconds 1200
  if ($script:node -and -not $script:node.HasExited) { Stop-Process -Id $script:node.Id -Force }
  $icon.Visible = $false
  [System.Windows.Forms.Application]::Exit()
})

Start-RoCrew $openAtStart

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 5000
$timer.add_Tick({
  if ($script:quitting -or -not $script:node.HasExited) { return }
  if ($script:node.ExitCode -eq 0) {
    # Quit from inside the app: leave the tray too.
    $icon.Visible = $false
    [System.Windows.Forms.Application]::Exit()
  } else {
    $icon.ShowBalloonTip(3000, 'RoCrew', 'RoCrew stopped unexpectedly and is starting again. Nothing was lost.', [System.Windows.Forms.ToolTipIcon]::Info)
    Start-RoCrew $false
  }
})
$timer.Start()
[System.Windows.Forms.Application]::Run()
