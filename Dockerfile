# ใช้ Node.js image ที่มีรุ่นที่ต้องการ
FROM node:20-alpine

# กำหนด working directory ภายใน container
WORKDIR /app

# คัดลอก package.json และ package-lock.json (หรือ yarn.lock ถ้าใช้ Yarn)
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์โปรเจคทั้งหมดไปที่ container
COPY . .

# สร้างโปรเจค (ถ้าจำเป็นต้องใช้ `next build` สำหรับ production)
RUN npm run build

# ใช้พอร์ตที่ Next.js ใช้โดยปกติ (สามารถเปลี่ยนได้)
EXPOSE 3000

# สั่งให้ container เริ่มทำงานด้วยคำสั่ง `next start`
CMD ["npm", "run", "start"]
