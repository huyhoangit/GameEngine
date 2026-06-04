# Tile images

Place PNG/WebP files here to replace number labels on the board.

## Quick start

- `0.png` — image for tile type `0`
- `1.png` — tile type `1`
- Or map custom filenames in `manifest.json`:

```json
{
  "basePath": "/tiles",
  "tiles": {
    "0": "apple.png",
    "3": "icons/cherry.webp"
  }
}
```

Types without a loaded texture still show their numeric id.
