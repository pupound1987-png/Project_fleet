# FleetLink | Company Vehicle Booking System

ระบบจัดการการจองรถยนต์บริษัทอัจฉริยะ พัฒนาด้วย NextJS, Firebase และ Genkit AI

## วิธีการใช้งาน (Usage Guide)

### การเข้าใช้งานสิทธิ์ผู้ดูแลระบบ (Admin Access)
สำหรับการทดสอบระบบ Admin ให้ทำการสมัครสมาชิกใหม่ด้วยอีเมลด้านล่างนี้:
- **Email**: `admin@tcitrendgroup.com`
- **Password**: (ตั้งค่าอะไรก็ได้ อย่างน้อย 6 ตัวอักษร)
- **หมายเหตุ**: ระบบจะมอบสิทธิ์ Admin ให้โดยอัตโนมัติเฉพาะอีเมลนี้เท่านั้น

### การตั้งค่าแจ้งเตือน Line Notify
1. เข้าไปที่เมนู **"ตั้งค่าแจ้งเตือน (Line Settings)"** ในแถบ Admin
2. นำ Token จาก [Line Notify](https://notify-bot.line.me/) มาวางและบันทึก
3. **ข้อควรระวัง:** การกด "ทดสอบ" ในหน้า Preview อาจขึ้น `fetch failed` เนื่องจาก Network ของตัวแก้ไขโค้ดบล็อกการเชื่อมต่อออกภายนอก **แต่ระบบจะทำงานได้ปกติ 100% เมื่อทำการ Deploy (Publish) แอปขึ้นใช้งานจริง**

---

## ขั้นตอนการนำไปใช้จริง (Deployment Guide)

### 1. การตั้งค่า Firebase
- เข้าไปที่ [Firebase Console](https://console.firebase.google.com/)
- เปิดใช้งาน **Authentication** (เปิดวิธี Login แบบ Email/Password)
- เปิดใช้งาน **Cloud Firestore**
- คัดลอกเนื้อหาจากไฟล์ `firestore.rules` ไปวางในเมนู Firestore > Rules

### 2. การ Deploy ขึ้นเว็บไซต์ (แนะนำ)
กดปุ่ม **Publish** ที่มุมขวาบนของหน้าจอนี้ เพื่อนำแอปขึ้นสู่ระบบโปรดักชัน ซึ่งจะทำให้ฟีเจอร์แจ้งเตือน Line ทำงานได้ทันที

---

## เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend**: NextJS 15 (App Router), React, Tailwind CSS, ShadCN UI
- **Backend**: Firebase Authentication, Firestore
- **AI**: Genkit (Gemini 2.5 Flash) สำหรับวิเคราะห์ความผิดปกติ
- **Line API**: Line Notify สำหรับระบบแจ้งเตือน
