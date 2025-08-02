import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wifi, 
  DollarSign, 
  Clock, 
  Zap, 
  CheckCircle, 
  Smartphone,
  CreditCard,
  Timer,
  Download,
  Upload,
  Shield,
  Globe,
  Phone,
  Mail,
  Info,
  ArrowRight,
  Star
} from "lucide-react";

export default function UserPortal() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    { 
      id: 1, 
      name: "Quick Browse", 
      duration: 1, 
      price: 10, 
      speed_down: 5, 
      speed_up: 2, 
      category: "hourly",
      description: "Perfect for quick browsing and social media",
      features: ["1 Hour Access", "5 Mbps Download", "2 Mbps Upload", "No Data Limit"],
      popular: false
    },
    { 
      id: 2, 
      name: "Power Hour", 
      duration: 2, 
      price: 18, 
      speed_down: 10, 
      speed_up: 5, 
      category: "hourly",
      description: "Great for streaming and video calls",
      features: ["2 Hours Access", "10 Mbps Download", "5 Mbps Upload", "HD Streaming"],
      popular: true
    },
    { 
      id: 3, 
      name: "Work Session", 
      duration: 4, 
      price: 35, 
      speed_down: 20, 
      speed_up: 10, 
      category: "hourly",
      description: "Ideal for remote work and conferences",
      features: ["4 Hours Access", "20 Mbps Download", "10 Mbps Upload", "Business Priority"],
      popular: false
    },
    { 
      id: 4, 
      name: "All Day Basic", 
      duration: 24, 
      price: 50, 
      speed_down: 5, 
      speed_up: 2, 
      category: "daily",
      description: "24-hour access for everyday use",
      features: ["24 Hours Access", "5 Mbps Download", "2 Mbps Upload", "Family Friendly"],
      popular: false
    },
    { 
      id: 5, 
      name: "All Day Premium", 
      duration: 24, 
      price: 80, 
      speed_down: 10, 
      speed_up: 5, 
      category: "daily",
      description: "Full day high-speed internet",
      features: ["24 Hours Access", "10 Mbps Download", "5 Mbps Upload", "Multi-Device"],
      popular: true
    },
    { 
      id: 6, 
      name: "All Day Pro", 
      duration: 24, 
      price: 120, 
      speed_down: 20, 
      speed_up: 10, 
      category: "daily",
      description: "Maximum speed for heavy users",
      features: ["24 Hours Access", "20 Mbps Download", "10 Mbps Upload", "Gaming Optimized"],
      popular: false
    }
  ];

  const paymentMethods = [
    { id: 'mpesa', name: 'M-Pesa', icon: '📱', fee: 'KES 1' },
    { id: 'airtel', name: 'Airtel Money', icon: '📲', fee: 'KES 2' },
    { id: 'tkash', name: 'T-Kash', icon: '💳', fee: 'KES 2' },
    { id: 'voucher', name: 'Voucher Code', icon: '🎫', fee: 'Free' }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handleVoucherRedeem = () => {
    if (!voucherCode.trim()) {
      alert('Please enter a voucher code');
      return;
    }
    
    setIsLoading(true);
    // Simulate voucher validation
    setTimeout(() => {
      setIsLoading(false);
      alert('Voucher redeemed successfully! You are now connected.');
      setShowVoucherDialog(false);
      setVoucherCode("");
    }, 2000);
  };

  const handlePayment = () => {
    if (!phoneNumber.trim() || !paymentMethod) {
      alert('Please fill in all payment details');
      return;
    }

    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      alert(`Payment of KES ${selectedPlan.price} processed successfully! You are now connected.`);
      setShowPaymentDialog(false);
      setPhoneNumber("");
      setPaymentMethod("");
      setSelectedPlan(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  PHP Radius Internet
                </h1>
                <p className="text-sm text-slate-500">High-Speed Internet Access</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>+254 700 000 000</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>support@phpradius.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
              Choose Your 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Internet Plan</span>
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Fast, reliable, and affordable internet access. Pay only for what you need.
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Dialog open={showVoucherDialog} onOpenChange={setShowVoucherDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Have a Voucher?</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>Redeem Voucher</DialogTitle>
                    <DialogDescription>Enter your voucher code to get instant access</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="voucher">Voucher Code</Label>
                      <Input
                        id="voucher"
                        placeholder="Enter voucher code"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        className="text-center font-mono text-lg"
                      />
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Voucher codes are case-insensitive and typically 6-10 characters long.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={handleVoucherRedeem} 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Validating...</span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Redeem Voucher
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button size="lg" className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Contact Support</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Internet Plans</h3>
            <p className="text-lg text-slate-600">Choose the perfect plan for your needs</p>
          </div>

          {/* Hourly Plans */}
          <div className="mb-16">
            <div className="flex items-center space-x-2 mb-6">
              <Timer className="h-6 w-6 text-blue-600" />
              <h4 className="text-2xl font-bold text-slate-900">Hourly Plans</h4>
              <Badge variant="secondary">Perfect for Quick Access</Badge>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.filter(plan => plan.category === 'hourly').map((plan) => (
                <Card key={plan.id} className={`relative overflow-hidden ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500 to-indigo-600 text-white px-3 py-1 text-sm font-medium">
                      <Star className="h-3 w-3 inline mr-1" />
                      Popular
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="flex items-center justify-center space-x-1 mt-4">
                      <span className="text-3xl font-bold text-blue-600">KES {plan.price}</span>
                      <span className="text-slate-500">/ {plan.duration}h</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Download className="h-4 w-4 text-green-600" />
                        <span>{plan.speed_down} Mbps</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Upload className="h-4 w-4 text-blue-600" />
                        <span>{plan.speed_up} Mbps</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span>{plan.duration} Hour{plan.duration > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-orange-600" />
                        <span>High Speed</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <ul className="space-y-2 text-sm text-slate-600">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Select Plan
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Daily Plans */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Globe className="h-6 w-6 text-green-600" />
              <h4 className="text-2xl font-bold text-slate-900">Daily Plans</h4>
              <Badge variant="secondary">24 Hour Access</Badge>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.filter(plan => plan.category === 'daily').map((plan) => (
                <Card key={plan.id} className={`relative overflow-hidden ${plan.popular ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-green-500 to-emerald-600 text-white px-3 py-1 text-sm font-medium">
                      <Star className="h-3 w-3 inline mr-1" />
                      Best Value
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="flex items-center justify-center space-x-1 mt-4">
                      <span className="text-3xl font-bold text-green-600">KES {plan.price}</span>
                      <span className="text-slate-500">/ day</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Download className="h-4 w-4 text-green-600" />
                        <span>{plan.speed_down} Mbps</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Upload className="h-4 w-4 text-blue-600" />
                        <span>{plan.speed_up} Mbps</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span>24 Hours</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-indigo-600" />
                        <span>Premium</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <ul className="space-y-2 text-sm text-slate-600">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Select Plan
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Wifi className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">PHP Radius</span>
              </div>
              <p className="text-slate-400 text-sm">
                Providing fast, reliable internet access across Kenya with affordable pay-as-you-use plans.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Plans & Pricing</a></li>
                <li><a href="#" className="hover:text-white">Coverage Areas</a></li>
                <li><a href="#" className="hover:text-white">How to Connect</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Support</a></li>
                <li><a href="#" className="hover:text-white">Network Status</a></li>
                <li><a href="#" className="hover:text-white">Report Issue</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+254 700 000 000</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@phpradius.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 PHP Radius Internet Services. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              {selectedPlan && `Pay KES ${selectedPlan.price} for ${selectedPlan.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              {/* Plan Summary */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedPlan.name}</h4>
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span>{selectedPlan.duration} hour{selectedPlan.duration > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Speed:</span>
                  <span>{selectedPlan.speed_down}/{selectedPlan.speed_up} Mbps</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">KES {selectedPlan.price}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <Label className="text-base font-medium mb-4 block">Select Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.filter(pm => pm.id !== 'voucher').map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{method.icon}</div>
                      <div className="font-medium text-sm">{method.name}</div>
                      <div className="text-xs text-slate-500">Fee: {method.fee}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number Input */}
              {paymentMethod && (
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the phone number registered with {paymentMethods.find(p => p.id === paymentMethod)?.name}
                  </p>
                </div>
              )}

              {/* Payment Button */}
              <Button 
                onClick={handlePayment}
                className="w-full"
                disabled={!paymentMethod || !phoneNumber.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Pay KES {selectedPlan.price}
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
