# Cấu hình màn chơi Pikachu

Chỉnh **`levels.json`** (và đồng bộ `frontend/public/pikachu/levels.json` khi chạy web).

## Cấu trúc

| Phần | Mô tả |
|------|--------|
| `defaults` | Giá trị mặc định mọi màn (kích thước, thời gian, số loại ô, lượt shuffle) |
| `levelOverrides` | Ghi đè theo số màn (`level`: 1, 2, 3…) — màn đầu dễ hơn |
| `mechanics` | Gán **cơ chế** cho từng màn qua mảng `levels` |

## Cơ chế

- **`gravityBottom`** — ô rơi xuống sau khi ghép
- **`gravityLeft`** / **`gravityRight`** / **`gravityTop`** — tương tự trái / phải / lên
- **`periodicShuffle`** — tự xáo ô mỗi `intervalSeconds` giây (không trừ lượt shuffle tay)

Có thể **gộp nhiều cơ chế** trên cùng một màn: thêm cùng số `level` vào nhiều mảng.

### Ví dụ: màn 12 vừa trọng lực dưới vừa xáo định kỳ

```json
"gravityBottom": { "levels": [4, 5, 12] },
"periodicShuffle": { "levels": [12, 13, 14, 15], "intervalSeconds": 5 }
```

### Ví dụ: thêm màn 10, 11 vào trọng lực trái

```json
"gravityLeft": { "levels": [6, 7, 10, 11] }
```

### Ví dụ: màn 13–15 chỉ xáo định kỳ 5 giây

```json
"periodicShuffle": { "levels": [13, 14, 15], "intervalSeconds": 5 }
```

## Màn không có trong `levelOverrides`

Từ màn 4 trở đi dùng `defaults` + cơ chế trong `mechanics`; độ khó tăng nhẹ theo số màn (ít thời gian hơn, nhiều loại ô hơn).
