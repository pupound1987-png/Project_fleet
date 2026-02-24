# FleetLink | Company Vehicle Booking System

ระบบจัดการการจองรถยนต์บริษัทอัจฉริยะ พัฒนาด้วย NextJS, Firebase และ Genkit AI

## วิธีการใช้งาน (Usage Guide)

### สำหรับพนักงาน (Employee)
1. **Register/Login**: สมัครสมาชิกและเข้าสู่ระบบ
2. **Browse Vehicles**: ตรวจสอบรถที่ว่างในเมนู "ยานพาหนะ"
3. **Make a Booking**: กรอกแบบฟอร์มในเมนู "จองรถ"
4. **View Calendar**: ดูตารางการใช้งานรถทั้งหมดในเมนู "ปฏิทิน"
5. **Track History**: ตรวจสอบสถานะการอนุมัติในหน้า "ประวัติของฉัน"

### สำหรับผู้ดูแลระบบ (Admin)
1. **Approvals**: อนุมัติหรือปฏิเสธคำขอใช้รถในหน้า "การอนุมัติ"
2. **Fleet Management**: เพิ่ม/ลบ/แก้ไข ข้อมูลรถในระบบ
3. **AI Anomaly Detection**: ใช้ AI วิเคราะห์ความผิดปกติของการจองที่หน้า Dashboard
4. **Line Notifications**: ตั้งค่า Token และ Group ID ในหน้า "ตั้งค่าแจ้งเตือน" เพื่อรับข่าวสารผ่าน Line
5. **Export Data**: ดาวน์โหลดรายงานการจองทั้งหมดเป็นไฟล์ CSV (Excel) ผ่านหน้า Dashboard

## เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend**: NextJS 15 (App Router), React, Tailwind CSS, ShadCN UI
- **Backend**: Firebase Authentication, Firestore
- **AI**: Genkit (Gemini 2.5 Flash) สำหรับวิเคราะห์ความผิดปกติ
- **Icons**: Lucide React
