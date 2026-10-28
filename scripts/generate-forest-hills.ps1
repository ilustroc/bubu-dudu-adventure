Add-Type -AssemblyName System.Drawing

$output = Join-Path $PSScriptRoot "..\assets\levels\level1\tilesets\forest-hills.png"
$directory = Split-Path -Parent $output
New-Item -ItemType Directory -Force -Path $directory | Out-Null

$tile = 18
$columns = 12
$rows = 8
$bitmap = [System.Drawing.Bitmap]::new($columns * $tile, $rows * $tile, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor

function Pixel([int]$tileX, [int]$tileY, [int]$x, [int]$y, [System.Drawing.Color]$color) {
  if ($x -ge 0 -and $x -lt $tile -and $y -ge 0 -and $y -lt $tile) {
    $bitmap.SetPixel($tileX * $tile + $x, $tileY * $tile + $y, $color)
  }
}

function Rect([int]$tileX, [int]$tileY, [int]$x, [int]$y, [int]$width, [int]$height, [System.Drawing.Color]$color) {
  for ($py = $y; $py -lt $y + $height; $py += 1) {
    for ($px = $x; $px -lt $x + $width; $px += 1) { Pixel $tileX $tileY $px $py $color }
  }
}

$grassDark = [System.Drawing.Color]::FromArgb(46, 126, 76)
$grass = [System.Drawing.Color]::FromArgb(74, 172, 88)
$grassLight = [System.Drawing.Color]::FromArgb(118, 205, 106)
$dirt = [System.Drawing.Color]::FromArgb(171, 112, 75)
$dirtLight = [System.Drawing.Color]::FromArgb(207, 146, 92)
$dirtShadow = [System.Drawing.Color]::FromArgb(130, 79, 67)
$leaf = [System.Drawing.Color]::FromArgb(54, 145, 76)
$leafLight = [System.Drawing.Color]::FromArgb(108, 193, 88)
$flower = [System.Drawing.Color]::FromArgb(255, 214, 105)
$transparent = [System.Drawing.Color]::Transparent

for ($ty = 0; $ty -lt $rows; $ty += 1) {
  for ($tx = 0; $tx -lt $columns; $tx += 1) {
    Rect $tx $ty 0 0 18 18 $dirt
    Rect $tx $ty 0 0 18 2 $grassDark
    Rect $tx $ty 0 2 18 3 $grass
    Rect $tx $ty 0 2 18 1 $grassLight
    if (($tx + $ty) % 2 -eq 0) { Rect $tx $ty 4 10 2 2 $dirtLight; Rect $tx $ty 13 14 2 1 $dirtShadow }
  }
}

# Row 0: grass caps, left/right slopes, rounded hill crowns.
for ($x = 0; $x -lt 18; $x += 1) { for ($y = 0; $y -lt 18; $y += 1) { if ($y -lt 17 - $x) { Pixel 0 0 $x $y $transparent }; if ($y -lt $x) { Pixel 2 0 $x $y $transparent } } }
for ($x = 0; $x -lt 18; $x += 1) { Pixel 0 0 $x (17 - $x) $grassLight; Pixel 2 0 $x $x $grassLight }
Rect 3 0 0 0 18 18 $transparent
for ($x = 0; $x -lt 18; $x += 1) { $top = [math]::Max(2, [math]::Floor(([math]::Abs($x - 8.5) - 2))); for ($y = $top; $y -lt 18; $y += 1) { Pixel 3 0 $x $y $dirt }; Pixel 3 0 $x $top $grassLight; if ($top + 1 -lt 18) { Pixel 3 0 $x ($top + 1) $grass } }
for ($i = 4; $i -lt 12; $i += 1) { Rect $i 0 0 0 18 18 $transparent }

# Row 1: dirt fill variants without dark borders, continuing surfaces.
for ($i = 0; $i -lt 12; $i += 1) { Rect $i 1 0 0 18 18 $dirt; Rect $i 1 (2 + (($i * 3) % 9)) (5 + ($i % 4)) 2 2 $dirtLight; Rect $i 1 (11 - ($i % 4)) (13 - ($i % 3)) 2 1 $dirtShadow }

# Row 2: embedded grass and small ledges.
for ($i = 0; $i -lt 12; $i += 1) { Rect $i 2 0 0 18 18 $transparent; Rect $i 2 1 11 16 7 $dirt; Rect $i 2 1 10 16 2 $grass; Rect $i 2 3 9 3 1 $grassLight; Rect $i 2 12 9 3 1 $grassLight }

# Row 3: shrubs and flowers on transparent tiles.
for ($i = 0; $i -lt 12; $i += 1) { Rect $i 3 0 0 18 18 $transparent; Rect $i 3 3 10 12 6 $leaf; Rect $i 3 5 7 8 8 $leaf; Rect $i 3 6 6 6 2 $leafLight; Rect $i 3 (3 + ($i % 8)) 8 2 2 $flower }

# Rows 4-7: coherent hill fills and transition vegetation.
for ($ty = 4; $ty -lt 8; $ty += 1) {
  for ($tx = 0; $tx -lt 12; $tx += 1) {
    Rect $tx $ty 0 0 18 18 $dirt
    if (($tx + $ty) % 3 -eq 0) { Rect $tx $ty 2 5 2 2 $dirtLight }
    if (($tx + $ty) % 4 -eq 0) { Rect $tx $ty 12 13 2 1 $dirtShadow }
  }
}

$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
Write-Output "Created $output"
