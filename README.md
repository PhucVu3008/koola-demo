# Koola Test Fullstack Project

Dự án fullstack sử dụng Node.js + Express + MongoDB + Next.js

## Công nghệ sử dụng

### Backend
- Node.js v22
- Express.js
- MongoDB (localhost)
- JWT Authentication
- bcryptjs

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- React Hook Form
- Axios

## Cài đặt và chạy dự án

### Tùy chọn 1: Dev Docker

```bash
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec backend npm run seed
```

### Tùy chọn 2: Setup thủ công

#### Yêu cầu
- Node.js v22+
- MongoDB đang chạy trên localhost:27017

#### Backend

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

4. Chỉnh sửa file `.env` nếu cần

5. Seed database (tạo dữ liệu mẫu):
```bash
npm run seed
```

Lệnh này sẽ tạo 3 users mẫu:
- **admin** / admin123 (role: lv3)
- **user_lv2** / user123 (role: lv2)
- **user_lv1** / user123 (role: lv1)

6. Chạy server:
```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:5001

#### Frontend

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## Tính năng

### Xác thực
- ✅ Đăng nhập bằng username/password
- ✅ Password được mã hóa (bcrypt)
- ✅ JWT token (hết hạn sau 2 phút)
- ✅ Block IP 30s sau khi đăng nhập sai nhiều lần

### Phân quyền
- **lv1**: Chỉ được xem danh sách user
- **lv2**: Xem, tạo, chỉnh sửa user
- **lv3**: Toàn quyền CRUD + truy cập Settings

### Quản lý User
- ✅ Xem danh sách user
- ✅ Tìm kiếm user
- ✅ Phân trang
- ✅ Tạo user mới (lv2, lv3)
- ✅ Chỉnh sửa user (lv2, lv3)
- ✅ Xóa user (lv3)

### Settings (chỉ lv3)
- ✅ Tùy chỉnh thời gian block IP
- ✅ Tùy chỉnh thời gian hết hạn Access token
- ✅ Đổi mật khẩu admin

### Bonus
- ✅ Tìm kiếm user
- ✅ Phân trang
- ✅ Ghi log login và thao tác CRUD

## Cấu trúc thư mục

### Backend
```
backend/
├── config/          # Cấu hình database
├── controllers/     # Controllers xử lý logic
├── middlewares/     # Middlewares (auth, error, logger)
├── models/          # MongoDB models
├── routes/          # API routes
├── scripts/         # Scripts (seed data)
├── utils/           # Utilities
└── server.js        # Entry point
```

### Frontend
```
frontend/
├── app/             # Next.js App Router
│   ├── login/       # Trang đăng nhập
│   ├── dashboard/   # Trang dashboard
│   ├── users/       # Quản lý users
│   └── settings/    # Cấu hình hệ thống
├── components/      # React components
├── lib/             # Libraries (axios config)
├── types/           # TypeScript types
└── utils/           # Utilities
```

## API Endpoints

### Authentication
- `POST /api/sessions` - Đăng nhập

### Users
- `GET /api/users` - Lấy danh sách users (lv1, lv2, lv3)
- `GET /api/users/:id` - Lấy thông tin user (lv2, lv3)
- `POST /api/users` - Tạo user mới (lv2, lv3)
- `PATCH /api/users/:id` - Cập nhật user (lv2, lv3)
- `DELETE /api/users/:id` - Xóa user (lv3)
- `PATCH /api/users/me/password` - Đổi mật khẩu admin (lv3)

### Settings
- `GET /api/settings` - Lấy danh sách settings (lv3)
- `PATCH /api/settings/:key` - Cập nhật setting (lv3)

### System & Logs
- `GET /api/system` - Thông tin hệ thống (lv3)
- `GET /api/logs` - Activity logs (lv3)

## Test accounts

| Username  | Password | Role |
|-----------|----------|------|
| admin     | admin123 | lv3  |
| user_lv2  | user123  | lv2  |
| user_lv1  | user123  | lv1  |

## Lưu ý
- MongoDB phải chạy trước khi start backend
- Token hết hạn sau 2 phút, cần đăng nhập lại
- IP bị block 30s sau 3 lần đăng nhập sai
- Có thể chuẩn hóa username hiện có bằng `npm run normalize-usernames`

## Chạy với Docker (Bonus)

### Yêu cầu
- Docker
- Docker Compose

### Chạy toàn bộ hệ thống

1. Build và chạy tất cả services:
```bash
docker compose up -d
```

2. Seed database (chỉ lần đầu):
```bash
docker compose exec backend npm run seed
```

3. Truy cập ứng dụng:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- MongoDB: localhost:27017

4. Dừng services:
```bash
docker compose down
```

5. Xóa volumes (nếu muốn reset database):
```bash
docker compose down -v
```
