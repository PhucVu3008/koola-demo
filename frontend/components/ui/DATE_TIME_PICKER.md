# DateTimePicker Component

Component chọn ngày và giờ hiện đại sử dụng `react-datepicker`.

## Cài đặt

```bash
npm install react-datepicker @types/react-datepicker
```

## Sử dụng

### 1. Date Picker (chỉ ngày)

```tsx
import { DateTimePicker } from '@/components/ui/date-time-picker';

const [selectedDate, setSelectedDate] = useState<Date | null>(null);

<DateTimePicker
  selected={selectedDate}
  onChange={(date) => setSelectedDate(date)}
  placeholderText="Chọn ngày"
  minDate={new Date()}
/>
```

### 2. DateTime Picker (ngày + giờ)

```tsx
<DateTimePicker
  selected={selectedDate}
  onChange={(date) => setSelectedDate(date)}
  showTimeSelect
  timeIntervals={15}
  placeholderText="Chọn ngày và giờ"
  minDate={new Date()}
/>
```

## Props

- `selected`: Date | null - Ngày được chọn
- `onChange`: (date: Date | null) => void - Callback khi thay đổi
- `showTimeSelect`: boolean - Hiển thị time picker (default: false)
- `timeIntervals`: number - Khoảng thời gian (phút) (default: 15)
- `dateFormat`: string - Format hiển thị (default: 'dd/MM/yyyy' hoặc 'dd/MM/yyyy HH:mm')
- `placeholderText`: string - Placeholder text
- `minDate`: Date - Ngày tối thiểu
- `maxDate`: Date - Ngày tối đa
- `disabled`: boolean - Disable picker

## Tính năng

✅ Icons tự động (Calendar hoặc Clock)
✅ Styling theo theme Tailwind
✅ Responsive design
✅ Vietnamese locale
✅ Min/Max date validation
✅ Time intervals customizable
✅ Disabled state support

## Ví dụ thực tế

Xem file: `/app/settings/page.tsx` để biết cách sử dụng trong Settings page.
