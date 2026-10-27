Add-Type -AssemblyName System.Drawing
$source = Join-Path $PSScriptRoot "..\public\assets\characters\bubu"
$target = Join-Path $source "normalized"
New-Item -ItemType Directory -Force -Path $target | Out-Null

function New-Canvas([int]$width, [int]$height) {
  $canvas = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  return @($canvas, $graphics)
}

$idle = [System.Drawing.Bitmap]::new((Join-Path $source "idle.png"))
$idleCanvas, $idleGraphics = New-Canvas 64 64
$idleGraphics.DrawImage($idle, [System.Drawing.Rectangle]::new(0, 0, 64, 64), 0, 0, $idle.Width, $idle.Height, [System.Drawing.GraphicsUnit]::Pixel)
$idleCanvas.Save((Join-Path $target "idle.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$idleGraphics.Dispose(); $idleCanvas.Dispose(); $idle.Dispose()

$victory = [System.Drawing.Bitmap]::new((Join-Path $source "victory.png"))
$frames = [System.Collections.Generic.List[System.Drawing.Rectangle]]::new()
for ($row = 0; $row -lt 16; $row++) { for ($column = 0; $column -lt 20; $column++) {
  $opaque = $false
  for ($x = $column * 64; $x -lt ($column + 1) * 64 -and -not $opaque; $x++) { for ($y = $row * 64; $y -lt ($row + 1) * 64; $y++) { if ($victory.GetPixel($x, $y).A -gt 20) { $opaque = $true; break } } }
  if ($opaque) { $frames.Add([System.Drawing.Rectangle]::new($column * 64, $row * 64, 64, 64)) }
} }
$columns = 16; $rows = [math]::Ceiling($frames.Count / $columns)
$victoryCanvas, $victoryGraphics = New-Canvas ($columns * 64) ($rows * 64)
for ($index = 0; $index -lt $frames.Count; $index++) { $destination = [System.Drawing.Rectangle]::new(($index % $columns) * 64, [math]::Floor($index / $columns) * 64, 64, 64); $victoryGraphics.DrawImage($victory, $destination, $frames[$index].X, $frames[$index].Y, 64, 64, [System.Drawing.GraphicsUnit]::Pixel) }
$victoryCanvas.Save((Join-Path $target "victory.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$victoryGraphics.Dispose(); $victoryCanvas.Dispose(); $victory.Dispose()
Write-Output "Normalizados: Idle 1 frame, Victory $($frames.Count) frames ($columns x $rows)."
