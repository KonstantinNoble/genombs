import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Auto-enable Safe Mode on mobile without UI
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                     window.matchMedia('(max-width: 767px)').matches;
    
    // Check if Safe Mode is already active
    const params = new URLSearchParams(window.location.search);
    const safeModeParam = params.get('safe') === '1';
    let safeModeStorage = false;
    try {
      safeModeStorage = localStorage.getItem('safe-mode') === 'true';
    } catch {}
    
    const alreadySafe = safeModeParam || safeModeStorage;
    
    // Check if we've already attempted auto-safe (prevent loops)
    let attempted = false;
    try {
      attempted = sessionStorage.getItem('auto-safe-attempted') === '1';
    } catch {}
    
    if (isMobile && !alreadySafe && !attempted) {
      try {
        sessionStorage.setItem('auto-safe-attempted', '1');
      } catch {}
      
      try {
        localStorage.setItem('safe-mode', 'true');
      } catch {}
      
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('safe', '1');
        window.location.replace(url.toString());
      } catch {
        window.location.reload();
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-semibold text-foreground">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                We encountered an unexpected error. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button 
                onClick={this.handleRetry}
                variant="default"
                className="w-full min-h-[44px]"
              >
                Try Again
              </Button>
              <Button 
                onClick={this.handleReload}
                variant="outline"
                className="w-full min-h-[44px]"
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
