// Keep in sync with backend username rules to avoid round-trip errors.
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_REGEX = /^[a-z][a-z0-9._]{2,29}$/;

// Normalize before validation/submission for consistent API behavior.
export const normalizeUsername = (value: string) => value.trim().toLowerCase();

export const getUsernameError = (value: string) => {
  const normalized = normalizeUsername(value);

  if (!normalized) {
    return 'Tên đăng nhập là bắt buộc';
  }

  if (normalized.length < USERNAME_MIN_LENGTH || normalized.length > USERNAME_MAX_LENGTH) {
    return `Tên đăng nhập phải từ ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} ký tự`;
  }

  if (!USERNAME_REGEX.test(normalized)) {
    return 'Chỉ dùng chữ thường, số, dấu chấm hoặc gạch dưới';
  }

  if (/[._]{2,}/.test(normalized)) {
    return 'Không dùng hai dấu chấm hoặc gạch dưới liên tiếp';
  }

  if (/[._]$/.test(normalized)) {
    return 'Tên đăng nhập không được kết thúc bằng dấu chấm hoặc gạch dưới';
  }

  return '';
};
