import React, { useState, useEffect } from "react";
import { fetchGoogleContacts, createGoogleMeetSpace, ContactItem } from "../workspace";
import { Users, Video, Clipboard, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";

interface ContactsMeetChatProps {
  onNotifyMeetCreated: (url: string) => void;
  theme?: "Light" | "Dark";
  language?: string;
}

const CONTACTS_TRANSLATIONS: Record<string, Record<string, string>> = {
  Eng: {
    meetTitle: "Instant De-Stress Meet Room",
    meetDesc: "Feeling overwhelmed? Click to schedule and create a real Google Meet room instantly to coordinate a 15-minute quick de-stress talk with your counselor or study companion.",
    apiBadge: "Google Meet API",
    scheduleButton: "Schedule Instantly inside Meet",
    scheduling: "Creating Meet space...",
    successTitle: "🎉 Real Google Meet Space Created Successfully!",
    copyLink: "Copy Link",
    copied: "Google Meet link copied to clipboard!",
    launchRoom: "Launch Room",
    createAnother: "Create Another",
    buddiesTitle: "Study Buddies & Connections",
    buddiesDesc: "Access your real Google Contacts directly. Search for a peer, counselor, or study buddy.",
    filterPlaceholder: "Filter study buddies...",
    noContacts: "No Google contacts found.",
    noMatching: "No matching contacts found.",
    fetching: "Fetching secure connections...",
    retry: "Retry Connection",
    connectButton: "Connect",
    confirmMeet: "Confirm: Create a 15-minute de-stress peer-to-peer session inside Google Meet?",
    confirmMail: "Launch email composer to contact {name}?"
  },
  Span: {
    meetTitle: "Sala de Meet Instantánea",
    meetDesc: "¿Te sientes abrumado? Haz clic para programar y crear una sala real de Google Meet al instante para coordinar una charla rápida de 15 minutos con tu consejero o compañero.",
    apiBadge: "Google Meet API",
    scheduleButton: "Programar al instante en Meet",
    scheduling: "Creando espacio de Meet...",
    successTitle: "🎉 ¡Sala de Google Meet Creada con Éxito!",
    copyLink: "Copiar enlace",
    copied: "¡Enlace de Google Meet copiado al portapapeles!",
    launchRoom: "Iniciar sala",
    createAnother: "Crear otra",
    buddiesTitle: "Compañeros y Conexiones de Estudio",
    buddiesDesc: "Accede directamente a tus contactos de Google. Busca un compañero o consejero.",
    filterPlaceholder: "Filtrar compañeros...",
    noContacts: "No se encontraron contactos de Google.",
    noMatching: "No se encontraron contactos coincidentes.",
    fetching: "Obteniendo conexiones seguras...",
    retry: "Reintentar conexión",
    connectButton: "Conectar",
    confirmMeet: "¿Confirmar: Crear una sesión de relajación de 15 minutos en Google Meet?",
    confirmMail: "¿Iniciar el redactor de correo para contactar a {name}?"
  },
  Hindi: {
    meetTitle: "त्वरित तनाव-मुक्ति मीट रूम",
    meetDesc: "अभिभूत महसूस कर रहे हैं? अपने काउंसलर या अध्ययन साथी के साथ 15 मिनट की त्वरित बातचीत का समन्वय करने के लिए तुरंत एक वास्तविक Google Meet रूम शेड्यूल करें।",
    apiBadge: "Google Meet API",
    scheduleButton: "Meet में तुरंत शेड्यूल करें",
    scheduling: "मीट स्पेस बनाया जा रहा है...",
    successTitle: "🎉 वास्तविक Google Meet स्पेस सफलतापूर्वक बनाया गया!",
    copyLink: "लिंक कॉपी करें",
    copied: "Google Meet लिंक क्लिपबोर्ड पर कॉपी हो गया!",
    launchRoom: "रूम शुरू करें",
    createAnother: "दूसरा बनाएं",
    buddiesTitle: "अध्ययन मित्र और संपर्क",
    buddiesDesc: "सीधे अपने वास्तविक Google संपर्क एक्सेस करें। किसी सहकर्मी या सलाहकार को खोजें।",
    filterPlaceholder: "अध्ययन मित्रों को फ़िल्टर करें...",
    noContacts: "कोई Google संपर्क नहीं मिला।",
    noMatching: "कोई मिलान वाले संपर्क नहीं मिले।",
    fetching: "सुरक्षित संपर्क फ़ेच किए जा रहे हैं...",
    retry: "कनेक्शन पुनः प्रयास करें",
    connectButton: "जोड़ें",
    confirmMeet: "पुष्टि करें: Google Meet के भीतर 15 मिनट का तनाव-मुक्ति सत्र बनाएं?",
    confirmMail: "{name} से संपर्क करने के लिए ईमेल कंपोजर लॉन्च करें?"
  },
  Bengali: {
    meetTitle: "তাত্ক্ষণিক ডি-স্ট্রেস মিট রুম",
    meetDesc: "অতিরিক্ত চাপ অনুভব করছেন? আপনার কাউন্সেলর বা স্টাডি সঙ্গীর সাথে ১৫ মিনিটের দ্রুত আলাপ সমন্বয় করতে তাত্ক্ষণিকভাবে একটি আসল গুগল মিট রুম শিডিউল করুন।",
    apiBadge: "Google Meet API",
    scheduleButton: "Meet-এ তাত্ক্ষণিকভাবে শিডিউল করুন",
    scheduling: "মিট স্পেস তৈরি করা হচ্ছে...",
    successTitle: "🎉 আসল গুগল মিট স্পেস সফলভাবে তৈরি হয়েছে!",
    copyLink: "লিঙ্ক কপি করুন",
    copied: "গুগল মিট লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে!",
    launchRoom: "রুম শুরু করুন",
    createAnother: "আরেকটি তৈরি করুন",
    buddiesTitle: "অধ্যয়নের বন্ধু এবং সংযোগ",
    buddiesDesc: "সরাসরি আপনার আসল গুগল পরিচিতি অ্যাক্সেস করুন। সহকর্মী বা পরামর্শদাতার সন্ধান করুন।",
    filterPlaceholder: "বন্ধুদের ফিল্টার করুন...",
    noContacts: "কোনো গুগল পরিচিতি পাওয়া যায়নি।",
    noMatching: "কোনো মেলানো পরিচিতি পাওয়া যায়নি।",
    fetching: "সংযোগগুলি খোঁজা হচ্ছে...",
    retry: "পুনরায় চেষ্টা করুন",
    connectButton: "সংযুক্ত হোন",
    confirmMeet: "নিশ্চিত করুন: Google Meet-এ ১৫ মিনিটের একটি পিয়ার-টু-পিয়ার সেশন তৈরি করবেন?",
    confirmMail: "{name} এর সাথে যোগাযোগ করতে ইমেল কম্পোজার চালু করবেন?"
  },
  French: {
    meetTitle: "Salle Meet Instantanée",
    meetDesc: "Vous vous sentez submergé ? Planifiez et créez instantanément une salle Google Meet pour discuter 15 minutes avec votre conseiller ou camarade d'étude.",
    apiBadge: "Google Meet API",
    scheduleButton: "Planifier instantanément dans Meet",
    scheduling: "Création de l'espace Meet...",
    successTitle: "🎉 Espace Google Meet créé avec succès !",
    copyLink: "Copier le lien",
    copied: "Lien Google Meet copié dans le presse-papiers !",
    launchRoom: "Lancer la salle",
    createAnother: "Créer un autre",
    buddiesTitle: "Camarades d'étude & Contacts",
    buddiesDesc: "Accédez directement à vos contacts Google. Recherchez un camarade ou un conseiller.",
    filterPlaceholder: "Filtrer les camarades...",
    noContacts: "Aucun contact Google trouvé.",
    noMatching: "Aucun contact correspondant trouvé.",
    fetching: "Récupération des contacts sécurisés...",
    retry: "Réessayer la connexion",
    connectButton: "Connecter",
    confirmMeet: "Confirmer : Créer une session de relaxation de 15 minutes sur Google Meet ?",
    confirmMail: "Lancer le client mail pour contacter {name} ?"
  }
};

export default function ContactsMeetChat({
  onNotifyMeetCreated,
  theme = "Light",
  language = "Eng",
}: ContactsMeetChatProps) {
  const isDark = theme === "Dark";
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [creatingMeet, setCreatingMeet] = useState(false);
  const [meetResult, setMeetResult] = useState<{ meetingUri: string; meetingCode: string } | null>(null);
  const [meetError, setMeetError] = useState<string | null>(null);

  const mt = (key: string): string => {
    const langSet = CONTACTS_TRANSLATIONS[language] || CONTACTS_TRANSLATIONS["Eng"];
    return langSet[key] || CONTACTS_TRANSLATIONS["Eng"][key] || key;
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoadingContacts(true);
    setContactsError(null);
    try {
      const data = await fetchGoogleContacts();
      setContacts(data);
    } catch (err: any) {
      console.warn("Could not load Google Contacts automatically:", err.message);
      setContactsError(
        mt("retry")
      );
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleCreateMeet = async () => {
    const confirmText = mt("confirmMeet");
    let confirm = true;
    try {
      confirm = window.confirm(confirmText);
    } catch (e) {
      console.warn("window.confirm blocked/not supported in this environment, bypassing", e);
    }
    if (!confirm) return;

    setCreatingMeet(true);
    setMeetError(null);
    setMeetResult(null);

    try {
      const res = await createGoogleMeetSpace();
      setMeetResult(res);
      onNotifyMeetCreated(res.meetingUri);
    } catch (err: any) {
      console.error("Meet Space Creation failed:", err);
      setMeetError("Could not schedule Meet room. Please make sure meet.space.created scope is authorized.");
    } finally {
      setCreatingMeet(false);
    }
  };

  const copyMeetUrl = () => {
    if (meetResult) {
      navigator.clipboard.writeText(meetResult.meetingUri);
      alert(mt("copied"));
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* 1. Google Meet Creation Section */}
      <div className={`rounded-[24px] p-6 border transition-all shadow-sm ${
        isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
      }`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#cb997e]" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
              {mt("meetTitle")}
            </h3>
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isDark ? "bg-[#2e221c] text-[#dca694]" : "bg-[#f9e5d8] text-[#7b5c54]"
          }`}>
            {mt("apiBadge")}
          </span>
        </div>
        <p className={`text-xs leading-relaxed mb-4 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
          {mt("meetDesc")}
        </p>

        {!meetResult ? (
          <button
            onClick={handleCreateMeet}
            disabled={creatingMeet}
            className={`w-full py-3 rounded-2xl font-serif italic text-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              isDark
                ? "bg-[#cb997e] text-[#0e1612] hover:bg-[#b7866b]"
                : "bg-[#cb997e] text-white hover:bg-[#b7866b]"
            }`}
          >
            <Video className="w-4 h-4" />
            {creatingMeet ? mt("scheduling") : mt("scheduleButton")}
          </button>
        ) : (
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? "bg-[#251812]/50 border-[#5e3823]" : "bg-[#fcf7f4] border-[#edd1be]"
          }`}>
            <p className={`text-xs font-semibold ${isDark ? "text-[#dca694]" : "text-[#7b5c54]"}`}>
              {mt("successTitle")}
            </p>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border select-all ${
              isDark
                ? "bg-[#0e1612] border-[#25372e] text-[#e1eae5]"
                : "bg-white border-[#e9e3d0] text-[#333d29]"
            }`}>
              <span className="text-xs font-mono break-all flex-1">
                {meetResult.meetingUri}
              </span>
              <button
                onClick={copyMeetUrl}
                className={`p-1 rounded ${isDark ? "text-[#93a298] hover:text-[#e1eae5]" : "text-[#6b705c] hover:text-[#5a6a4e]"}`}
                title={mt("copyLink")}
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <a
                href={meetResult.meetingUri}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 text-xs font-medium py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                  isDark
                    ? "bg-[#81a290] text-[#0e1612] hover:bg-[#719280]"
                    : "bg-[#5a6a4e] text-white hover:bg-[#4a5d4e]"
                }`}
              >
                {mt("launchRoom")} <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setMeetResult(null)}
                className={`text-xs px-3 rounded-xl border transition-colors ${
                  isDark
                    ? "bg-[#0e1612] border-[#25372e] text-[#93a298] hover:bg-[#16221c]"
                    : "bg-white border-[#e6e2da] text-[#6b705c] hover:bg-slate-50"
                }`}
              >
                {mt("createAnother")}
              </button>
            </div>
          </div>
        )}

        {meetError && (
          <div className={`mt-2 text-xs p-2.5 rounded-xl border flex items-start gap-1.5 ${
            isDark ? "bg-rose-955/40 border-rose-900/55 text-rose-400" : "bg-rose-50 border border-rose-100 text-rose-600"
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{meetError}</span>
          </div>
        )}
      </div>

      {/* 2. Google Contacts Peer List */}
      <div className={`rounded-[24px] p-6 border transition-all shadow-sm ${
        isDark ? "bg-[#16221c] border-[#25372e]" : "bg-white border-[#e6e2da]"
      }`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#5a6a4e]" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#e1eae5]" : "text-[#6b705c]"}`}>
              {mt("buddiesTitle")}
            </h3>
          </div>
          <button
            onClick={loadContacts}
            disabled={loadingContacts}
            className={`p-1 ${isDark ? "text-[#93a298] hover:text-[#e1eae5]" : "text-[#6b705c] hover:text-[#5a6a4e]"}`}
            title="Reload Contacts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingContacts ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className={`text-xs leading-relaxed mb-4 ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
          {mt("buddiesDesc")}
        </p>

        {contactsError ? (
          <div className={`p-4 rounded-2xl border border-dashed text-center space-y-2 ${
            isDark ? "bg-[#0e1612] border-[#25372e]" : "bg-[#fdfaf5] border-[#d4d1c9]"
          }`}>
            <p className={`text-xs italic ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>{contactsError}</p>
            <button
              onClick={loadContacts}
              className={`text-xs font-semibold underline ${isDark ? "text-[#81a290]" : "text-[#5a6a4e]"}`}
            >
              {mt("retry")}
            </button>
          </div>
        ) : loadingContacts ? (
          <div className={`flex flex-col items-center justify-center py-8 text-xs gap-2 ${
            isDark ? "text-[#93a298]" : "text-[#6b705c]"
          }`}>
            <span className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${
              isDark ? "border-[#81a290]" : "border-[#5a6a4e]"
            }`}></span>
            <span>{mt("fetching")}</span>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className={`text-center py-6 text-xs rounded-2xl border italic ${
            isDark ? "bg-[#0e1612] border-[#25372e] text-[#93a298]" : "bg-[#fdfaf5] border-[#e6e2da] text-[#6b705c]"
          }`}>
            {searchQuery ? mt("noMatching") : mt("noContacts")}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              placeholder={mt("filterPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-xl text-xs focus:outline-none transition-all ${
                isDark
                  ? "bg-[#0e1612] border border-[#25372e] text-[#e1eae5] focus:border-[#81a290]"
                  : "bg-[#fdfaf5] border border-[#e6e2da] text-[#333d29] focus:border-[#5a6a4e]"
              }`}
            />
            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                    isDark ? "hover:bg-[#1d2f26]/40" : "hover:bg-[#e6ebe0]/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={contact.photoUrl}
                      alt={contact.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-white object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop";
                      }}
                    />
                    <div>
                      <h4 className={`text-xs font-semibold ${isDark ? "text-[#e1eae5]" : "text-[#333d29]"}`}>{contact.name}</h4>
                      <p className={`text-[10px] truncate max-w-[150px] ${isDark ? "text-[#93a298]" : "text-[#6b705c]"}`}>
                        {contact.email || contact.phone || "No details"}
                      </p>
                    </div>
                  </div>
                  {contact.email && (
                    <button
                      onClick={() => {
                        let emailConfirm = true;
                        try {
                          emailConfirm = window.confirm(mt("confirmMail").replace("{name}", contact.name));
                        } catch (e) {
                          console.warn("window.confirm blocked/not supported in this environment, bypassing", e);
                        }
                        if (emailConfirm) {
                          window.location.href = `mailto:${contact.email}?subject=Mindful%20Scholar%20Study%20Session&body=Hey%20${contact.name},%20do%20you%20have%2015%20minutes%20for%20a%20study%20de-stress%20break?`;
                        }
                      }}
                      className={`text-[10px] border px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        isDark
                          ? "bg-[#0e1612] border-[#25372e] text-[#81a290] hover:bg-[#1d2f26]"
                          : "bg-white border-[#e6e2da] text-[#5a6a4e] hover:bg-[#e6ebe0]"
                      }`}
                    >
                      {mt("connectButton")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
