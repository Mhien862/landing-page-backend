# Landing Page Backend API

Backend API cho hệ thống quản lý Landing Page với tính năng quản lý tin tức và cài đặt.

## Tính năng

- 🔐 Xác thực JWT với phân quyền (Super Admin, Admin, Editor)
- 📰 Quản lý bài viết tin tức (CRUD)
- ⚙️ Quản lý cài đặt hệ thống
- 📝 Quản lý form liên hệ
- 🔒 Phân quyền dựa trên vai trò người dùng

## Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd BE
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Cấu hình biến môi trường:
```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin database của bạn
```

4. Chạy server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký (chỉ admin)

### Articles (Tin tức)
- `GET /api/articles` - Lấy danh sách bài viết (admin)
- `GET /api/articles/:id` - Lấy chi tiết bài viết (admin)
- `POST /api/articles` - Tạo bài viết mới
- `PUT /api/articles/:id` - Cập nhật bài viết
- `DELETE /api/articles/:id` - Xóa bài viết
- `GET /api/articles/public` - Lấy bài viết công khai
- `GET /api/articles/public/:id` - Lấy chi tiết bài viết công khai

### Settings (Cài đặt)
- `GET /api/settings/hero-banner` - Lấy cài đặt hero banner
- `PUT /api/settings/hero-banner` - Cập nhật hero banner

### Contacts (Liên hệ)
- `POST /api/contacts` - Gửi form liên hệ
- `GET /api/contacts` - Lấy danh sách liên hệ (admin)

## Phân quyền

- **Super Admin**: Toàn quyền quản lý hệ thống
- **Admin**: Quản lý tất cả bài viết và cài đặt
- **Editor**: Chỉ quản lý bài viết của mình

## Deploy lên Vercel

1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình biến môi trường trong Vercel Dashboard
4. Deploy

## Biến môi trường

Xem file `.env.example` để biết các biến môi trường cần thiết.

## License

MIT License 