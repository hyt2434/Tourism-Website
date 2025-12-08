import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  DollarSign,
  User,
  FileText,
  Calendar,
  Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { 
  getPendingPartnerRegistrations, 
  approvePartnerRegistration, 
  rejectPartnerRegistration 
} from "../../api/partnerRegistrations";

export default function PartnerApprovalTab() {
  const { translations: t } = useLanguage();
  const toast = useToast();
  const [pendingPartners, setPendingPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch pending partners
  useEffect(() => {
    fetchPendingPartners();
  }, []);

  const fetchPendingPartners = async () => {
    setLoading(true);
    try {
      const data = await getPendingPartnerRegistrations();
      setPendingPartners(data);
    } catch (error) {
      console.error("Error fetching pending partners:", error);
      toast.error("Failed to load pending partner registrations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (partnerId) => {
    if (!confirm("Are you sure you want to approve this partner? A user account will be created automatically.")) {
      return;
    }
    
    try {
      const result = await approvePartnerRegistration(partnerId);
      
      setPendingPartners(prev => prev.filter(p => p.id !== partnerId));
      
      // Show credentials to admin
      toast.success(`Partner approved successfully!\n\nUser account created:\nEmail: ${result.email}\nTemporary Password: ${result.temporaryPassword}\n\nPlease send these credentials to the partner via email.`);
    } catch (error) {
      console.error("Error approving partner:", error);
      toast.error(`Failed to approve partner: ${error.message}`);
    }
  };

  const handleReject = async (partnerId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;
    
    try {
      await rejectPartnerRegistration(partnerId, reason);
      
      setPendingPartners(prev => prev.filter(p => p.id !== partnerId));
      toast.success("Partner registration rejected successfully.");
    } catch (error) {
      console.error("Error rejecting partner:", error);
      toast.error(`Failed to reject partner: ${error.message}`);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "accommodation": return <Building className="w-5 h-5" />;
      case "transportation": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
      case "restaurant": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
      default: return <Building className="w-5 h-5" />;
    }
  };

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case "accommodation": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "transportation": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "restaurant": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Pending Partners List */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            {t.pendingPartnerRegs}
          </CardTitle>
          <CardDescription>
            {t.pendingPartnerRegsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : pendingPartners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>{t.noPendingRegistrations}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                        {getTypeIcon(partner.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {partner.businessName}
                          </h3>
                          <Badge className={`${getTypeBadgeColor(partner.type)} border-0`}>
                            {partner.type.charAt(0).toUpperCase() + partner.type.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {partner.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {partner.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Submitted: {formatDate(partner.submittedAt)}
                          </div>
                          {partner.starRating && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {partner.starRating} Star Rating
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {partner.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPartner(partner)}
                            className="dark:border-gray-600"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="!max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">{partner.businessName}</DialogTitle>
                            <DialogDescription>Complete registration details</DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                                <p className="text-gray-900 dark:text-white">{partner.email}</p>
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</label>
                                <p className="text-gray-900 dark:text-white">{partner.phone}</p>
                              </div>
                            </div>
                            
                            {partner.type === "accommodation" && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Star Rating</label>
                                    <p className="text-gray-900 dark:text-white">{partner.starRating} Stars</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Price Range</label>
                                    <p className="text-gray-900 dark:text-white">{partner.priceRange}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Amenities</label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {partner.amenities?.map((amenity, idx) => (
                                      <Badge key={idx} variant="secondary">{amenity}</Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Branches</label>
                                  <div className="space-y-2 mt-1">
                                    {partner.branches?.map((branch, idx) => (
                                      <div key={idx} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                        <p className="font-medium">{branch.city}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{branch.address}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {partner.type === "transportation" && (
                              <>
                                <div>
                                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Vehicle Types</label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {partner.vehicleTypes?.map((type, idx) => (
                                      <Badge key={idx} variant="secondary">{type}</Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Routes</label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {partner.routes?.map((route, idx) => (
                                      <Badge key={idx} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{route}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                            
                            <div>
                              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                              <p className="text-gray-900 dark:text-white mt-1">{partner.description}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        onClick={() => handleApprove(partner.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      
                      <Button
                        onClick={() => handleReject(partner.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
