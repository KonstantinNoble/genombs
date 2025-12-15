declare global {
  interface Window {
    FS: {
      Checkout: new (config: FreemiusCheckoutConfig) => FreemiusCheckoutHandler;
    };
  }
}

interface FreemiusCheckoutConfig {
  product_id: string;
  plan_id: string;
  public_key: string;
  image?: string;
}

interface FreemiusCheckoutHandler {
  open(options: FreemiusCheckoutOptions): void;
}

interface FreemiusCheckoutOptions {
  name?: string;
  licenses?: number;
  email?: string;
  purchaseCompleted?: (response: FreemiusResponse) => void;
  success?: (response: FreemiusResponse) => void;
  cancel?: () => void;
}

interface FreemiusResponse {
  user: { email: string };
  license: { key: string };
}

export {};
