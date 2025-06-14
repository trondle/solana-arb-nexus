
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, FileText, Globe, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ComplianceCheck {
  id: string;
  name: string;
  status: 'compliant' | 'warning' | 'violation' | 'pending';
  jurisdiction: string;
  lastCheck: string;
  details: string;
}

interface KYCAMLStatus {
  kycVerified: boolean;
  amlClearance: boolean;
  riskScore: number;
  lastUpdate: string;
}

const RegulatoryCompliance = () => {
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([
    {
      id: 'us-sec',
      name: 'SEC Compliance',
      status: 'compliant',
      jurisdiction: 'United States',
      lastCheck: '2 hours ago',
      details: 'All transactions comply with SEC regulations'
    },
    {
      id: 'eu-mifid',
      name: 'MiFID II Requirements',
      status: 'warning',
      jurisdiction: 'European Union',
      lastCheck: '1 hour ago',
      details: 'Transaction reporting requirements need attention'
    },
    {
      id: 'jp-fsa',
      name: 'FSA Guidelines',
      status: 'compliant',
      jurisdiction: 'Japan',
      lastCheck: '30 minutes ago',
      details: 'Fully compliant with FSA crypto regulations'
    }
  ]);

  const [kycAmlStatus, setKycAmlStatus] = useState<KYCAMLStatus>({
    kycVerified: true,
    amlClearance: true,
    riskScore: 15, // Low risk
    lastUpdate: '6 hours ago'
  });

  const [transactionReporting, setTransactionReporting] = useState({
    pendingReports: 3,
    submittedToday: 47,
    complianceScore: 94
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'violation': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'violation': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const generateComplianceReport = () => {
    console.log('Generating compliance report...');
  };

  return (
    <div className="space-y-6">
      {/* KYC/AML Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            KYC/AML Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className={`w-5 h-5 ${kycAmlStatus.kycVerified ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <div className="font-semibold">KYC Verified</div>
                <div className="text-sm text-muted-foreground">
                  {kycAmlStatus.kycVerified ? 'Verified' : 'Pending'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 ${kycAmlStatus.amlClearance ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <div className="font-semibold">AML Clearance</div>
                <div className="text-sm text-muted-foreground">
                  {kycAmlStatus.amlClearance ? 'Cleared' : 'Under Review'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 ${kycAmlStatus.riskScore < 30 ? 'text-green-500' : 'text-yellow-500'}`} />
              <div>
                <div className="font-semibold">Risk Score</div>
                <div className="text-sm text-muted-foreground">
                  {kycAmlStatus.riskScore}/100 (Low Risk)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jurisdiction Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Regulatory Compliance by Jurisdiction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceChecks.map((check) => (
              <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="font-semibold">{check.name}</div>
                    <div className="text-sm text-muted-foreground">{check.jurisdiction}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge className={getStatusColor(check.status)}>
                      {check.status.toUpperCase()}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last check: {check.lastCheck}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Reporting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Transaction Reporting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {transactionReporting.pendingReports}
              </div>
              <div className="text-sm text-muted-foreground">Pending Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {transactionReporting.submittedToday}
              </div>
              <div className="text-sm text-muted-foreground">Submitted Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {transactionReporting.complianceScore}%
              </div>
              <div className="text-sm text-muted-foreground">Compliance Score</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Compliance Score</span>
              <span>{transactionReporting.complianceScore}%</span>
            </div>
            <Progress value={transactionReporting.complianceScore} />
          </div>

          <Button onClick={generateComplianceReport} className="w-full">
            Generate Compliance Report
          </Button>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>EU MiFID II:</strong> Transaction reporting deadline approaching in 2 hours
              </AlertDescription>
            </Alert>
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Info:</strong> New regulatory guidelines published for DeFi activities
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegulatoryCompliance;
