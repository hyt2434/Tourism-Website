import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import PartnerApprovalTab from "./PartnerApprovalTab";
import { Clock, RefreshCw, UserCheck } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function PartnerManagementTab() {
  const { translations: t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState("pending");

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl h-auto">
          <TabsTrigger
            value="pending"
            className="flex items-center gap-2 py-3 text-base font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <Clock className="w-5 h-5" />
            {t.pendingPartnerRegistrations}
          </TabsTrigger>
          <TabsTrigger
            value="updates"
            className="flex items-center gap-2 py-3 text-base font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <RefreshCw className="w-5 h-5" />
            {t.partnerUpdates}
            <span className="ml-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full font-bold">
              {t.comingSoon}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <PartnerApprovalTab />
        </TabsContent>

        <TabsContent value="updates" className="mt-6">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t.partnerUpdatesSection}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t.partnerUpdatesDesc}
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-4">
                <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
                  {t.featureComingSoon}
                </p>
                <ul className="text-sm text-purple-600 dark:text-purple-400 mt-2 space-y-1 text-left list-disc list-inside">
                  <li>{t.partnerServiceUpdates}</li>
                  <li>{t.newItemSubmissions}</li>
                  <li>{t.pricingModifications}</li>
                  <li>{t.imageUpdates}</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
