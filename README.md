# Hyperliquid Event Crawl System - MVP

Hệ thống thu thập và xử lý sự kiện từ Hyperliquid API.

## Kiến trúc hệ thống

Hệ thống được chia thành các lớp chính:

1. **Data Ingestion Layer**: Thu thập dữ liệu thô từ Hyperliquid API
   - Crawler Service: Kết nối với API và thu thập sự kiện
   - Message Queue 1: Lưu trữ tạm thời các sự kiện thô

2. **Data Processing Layer**: Xử lý và làm giàu dữ liệu
   - Data Filter Service: Lọc và làm sạch dữ liệu thô
   - Message Queue 2: Lưu trữ tạm thời các sự kiện đã lọc
   - Data Enricher Service: Làm giàu dữ liệu với thông tin bổ sung

3. **Data Storage Layer**: Lưu trữ dữ liệu đã xử lý
   - Event Database: Cơ sở dữ liệu lưu trữ sự kiện

4. **Monitoring & Management**: Giám sát hệ thống
   - Metrics Collector: Thu thập các chỉ số hiệu suất
   - Alert Manager: Quản lý cảnh báo

## Cài đặt

1. Clone repository:
```
git clone https://github.com/yourusername/hyperliquid-crawler-mvp.git
cd hyperliquid-crawler-mvp
```

2. Cài đặt dependencies:
```
npm install
```

3. Tạo file .env từ .env.example:
```
cp .env.example .env
```

4. Cấu hình các biến môi trường trong file .env

## Chạy ứng dụng

### Chế độ phát triển:
```
npm run dev
```

### Build và chạy:
```
npm run build
npm start
```

## Yêu cầu hệ thống

- Node.js 16+
- MongoDB
- RabbitMQ

## Giấy phép

MIT 