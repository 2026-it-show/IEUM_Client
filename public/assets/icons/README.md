# icons

SVG 아이콘 파일을 보관합니다.

## 사용 방법

### 1. ReactComponent로 import (권장)

`vite-plugin-svgr` 을 설치한 뒤 컴포넌트로 사용할 수 있습니다.

```tsx
import LogoIcon from '@/assets/icons/logo.svg?react';

<LogoIcon width={24} height={24} />
```

### 2. URL 로 import

```tsx
import logoUrl from '@/assets/icons/logo.svg';

<img src={logoUrl} alt="logo" />
```
