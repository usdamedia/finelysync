import React, { useState, useEffect } from 'react';
import { Users, Link, Unlink, Share2, Loader2, Check, MessageCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { db, firebase } from '../../../services/firebase';
import { UserSettings } from '../../../types';
import { Modal, Button, Badge, useToast } from '../../../components/ui';

interface FamilySyncProps {
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  email?: string | null;
  t: any;
}

const FamilySync: React.FC<FamilySyncProps> = ({ settings, onUpdateSettings, email, t }) => {
  const toast = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [incomingInvites, setIncomingInvites] = useState<any[]>([]);
  const [checkingInvites, setCheckingInvites] = useState(false);
  const [lastInvitedEmail, setLastInvitedEmail] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [isInvitesExpanded, setIsInvitesExpanded] = useState(false);

  useEffect(() => {
    if (email && !settings.linkedAccountId && settings.role !== 'Bujang') checkForInvites();
  }, [email, settings.linkedAccountId, settings.role]);

  const checkForInvites = async () => {
    setCheckingInvites(true);
    try {
      const normalizedEmail = email?.toLowerCase();
      const snapshot = await db.collection('invitations').where('toEmail', '==', normalizedEmail).where('status', '==', 'pending').get();
      setIncomingInvites(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setCheckingInvites(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !email) return;
    setInviteLoading(true);
    setInviteStatus('idle');
    const normalizedToEmail = inviteEmail.trim().toLowerCase();
    const normalizedFromEmail = email.toLowerCase();
    try {
      const user = firebase.auth().currentUser;
      if (!user) return;
      await db.collection('invitations').add({
        fromUid: user.uid,
        fromEmail: normalizedFromEmail,
        toEmail: normalizedToEmail,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setLastInvitedEmail(normalizedToEmail);
      setInviteStatus('success');
      setInviteEmail('');
    } catch (error) {
      console.error('Error sending invite:', error);
      setInviteStatus('error');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAcceptInvite = async (invite: any) => {
    try {
      onUpdateSettings({ ...settings, linkedAccountId: invite.fromUid, linkedAccountEmail: invite.fromEmail, sharedAccountIds: [] });
      await db.collection('invitations').doc(invite.id).update({ status: 'accepted' });
      setIncomingInvites((prev) => prev.filter((i) => i.id !== invite.id));
      toast.success(`Berjaya disambung dengan ${invite.fromEmail}.`);
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Gagal menerima jemputan.');
    }
  };

  const handleWhatsAppShare = () => {
    if (!partnerPhone) return;
    const targetRole = settings.role === 'Suami' ? 'Isteriku' : 'Suamiku';
    const text = `Salam dan Hai ${targetRole}\nSila buka app FinelySync.\nDaftar/Log masuk menggunakan emel: ${lastInvitedEmail}\nPergi ke Profil > Family Sync dan tekan 'Terima'.\nhttps://finelysync-197406599810.us-west1.run.app`;
    const cleanPhone = partnerPhone.replace(/\+/g, '').replace(/-/g, '').replace(/\s/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const confirmUnlink = () => {
    onUpdateSettings({ ...settings, linkedAccountId: '' as any, linkedAccountEmail: '' as any, sharedAccountIds: [] });
    setShowUnlinkConfirm(false);
  };

  return (
    <div className="bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)]">
      <div className="flex items-center gap-3 mb-4">
        <span className="p-2 bg-tertiary/12 rounded-xl text-tertiary">
          <Users className="w-6 h-6" />
        </span>
        <div>
          <h3 className="type-headline text-onSurface">{t.familySync}</h3>
          <p className="type-footnote">Kongsi dashboard dengan pasangan.</p>
        </div>
      </div>

      {settings.linkedAccountId ? (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="type-caption font-semibold text-success uppercase block mb-1">Akaun Dipautkan</span>
            <p className="type-subheadline font-medium text-onSurface flex items-center gap-2 truncate">
              <Link className="w-4 h-4 shrink-0" /> {settings.linkedAccountEmail || 'Partner'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUnlinkConfirm(true)}
            className="p-2 bg-surface text-error rounded-xl hover:bg-error/10 border border-error/20 transition-colors shrink-0"
            title="Nyahpaut akaun"
            aria-label="Nyahpaut akaun"
          >
            <Unlink className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-surfaceVariant/40 rounded-xl p-4 border border-outline">
            <label className="type-caption font-semibold text-primary mb-2 block uppercase">{t.invitePartner}</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="partner@email.com"
                className="flex-1 min-w-0 bg-surface text-onSurface border border-outline rounded-xl px-3.5 h-11 type-subheadline outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button onClick={handleSendInvite} disabled={inviteLoading || !inviteEmail} leftIcon={inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}>
                Jemput
              </Button>
            </div>

            {inviteStatus === 'success' && (
              <div className="mt-4 bg-success/10 border border-success/20 rounded-xl p-4 animate-scale-in">
                <div className="flex items-center gap-2 mb-2 text-success type-subheadline font-semibold">
                  <Check className="w-4 h-4" /> Jemputan dihantar!
                </div>
                <p className="type-footnote mb-4">Emel dihantar ke <b className="text-onSurface">{lastInvitedEmail}</b>. Maklumkan melalui WhatsApp untuk terima.</p>
                <div className="bg-surface rounded-lg border border-outline p-3 mb-3">
                  <label className="type-caption font-semibold uppercase mb-1 block">No. Telefon (WhatsApp)</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      placeholder="601xxxxxxxxx"
                      className="flex-1 min-w-0 bg-transparent border-b border-outline type-subheadline py-1 outline-none focus:border-primary"
                    />
                    <button onClick={handleWhatsAppShare} disabled={!partnerPhone} className="bg-success text-white p-2 rounded-lg disabled:opacity-50" aria-label="Hantar WhatsApp">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button onClick={() => { setInviteStatus('idle'); setPartnerPhone(''); }} className="type-caption text-success underline font-medium">
                  Selesai
                </button>
              </div>
            )}

            {inviteStatus === 'error' && (
              <p className="type-caption text-error mt-2 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Gagal menghantar jemputan.
              </p>
            )}
          </div>

          {incomingInvites.length > 0 && (
            <div className="animate-scale-in">
              <button onClick={() => setIsInvitesExpanded(!isInvitesExpanded)} className="flex items-center justify-between w-full type-caption font-semibold text-onSurfaceVariant uppercase mb-3 hover:text-primary">
                <span>Jemputan Diterima ({incomingInvites.length})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isInvitesExpanded ? 'rotate-180' : ''}`} />
              </button>
              {isInvitesExpanded && (
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {incomingInvites.map((invite) => (
                    <div key={invite.id} className="bg-primary/8 border border-primary/20 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center type-caption font-semibold shrink-0">
                          {invite.fromEmail.charAt(0).toUpperCase()}
                        </span>
                        <span className="type-caption font-semibold text-onSurface truncate" title={invite.fromEmail}>Dari: {invite.fromEmail}</span>
                      </div>
                      <Button size="sm" onClick={() => handleAcceptInvite(invite)}>Terima</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!checkingInvites && incomingInvites.length === 0 && <p className="text-center type-caption">Belum ada jemputan diterima.</p>}
        </div>
      )}

      <Modal isOpen={showUnlinkConfirm} onClose={() => setShowUnlinkConfirm(false)} title="Nyahpaut akaun?" size="sm">
        <div className="flex items-start gap-3 mb-5">
          <span className="w-11 h-11 rounded-2xl bg-error/12 text-error flex items-center justify-center shrink-0">
            <Unlink className="w-6 h-6" />
          </span>
          <p className="type-subheadline text-onSurfaceVariant leading-relaxed">
            Adakah anda pasti mahu nyahpaut akaun pasangan ini? Anda tidak akan dapat melihat dashboard mereka lagi.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowUnlinkConfirm(false)}>{t.cancel}</Button>
          <Button variant="destructive" fullWidth onClick={confirmUnlink}>Ya, Nyahpaut</Button>
        </div>
      </Modal>
    </div>
  );
};

export default FamilySync;
