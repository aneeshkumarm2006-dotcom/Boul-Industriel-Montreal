import numpy as np, soundfile as sf, json
from scipy import signal
import librosa
SP=r"C:/Users/anees/AppData/Local/Temp/claude/C--Users-anees-Desktop-realestate-website-clone/8d158d13-a38d-409e-8f48-783eed739e9f/scratchpad"
mix,sr=sf.read(SP+"/final-mix.wav"); mix=mix.mean(axis=1) if mix.ndim>1 else mix
orig,sr2=sf.read(SP+"/orig-music-24s.wav"); assert sr==sr2
# 1) global offset of the music inside the render: correlate mix[1.0:6.0] vs orig[0:8]
a=mix[int(1.0*sr):int(6.0*sr)]; b=orig[:int(8*sr)]
# band-limit both to 100-2000 Hz to ignore SFX/HF
sos=signal.butter(4,[100,2000],btype='band',fs=sr,output='sos')
a=signal.sosfilt(sos,a); b=signal.sosfilt(sos,b)
corr=signal.correlate(b,a,mode='valid',method='fft')
lag=np.argmax(corr)/sr   # position in orig where mix[1.0:6.0] best matches
print("music offset: mix t=1.0s matches orig t=%.4f s  => render delay = %.1f ms (positive = music LATE vs composition time)"%(lag,(1.0-lag)*1000))
# 2) beat tracking on the mix vs bundled preset grid
preset=json.load(open(r"C:/Users/anees/.claude/skills/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json"))
pb=np.array([b["time"] for b in preset["beats"] if b["time"]<=22])
m=signal.sosfilt(signal.butter(4,[40,4000],btype='band',fs=sr,output='sos'),mix)
oenv=librosa.onset.onset_strength(y=m.astype(np.float32),sr=sr,hop_length=256)
times=librosa.times_like(oenv,sr=sr,hop_length=256)
tempo,bt=librosa.beat.beat_track(onset_envelope=oenv,sr=sr,hop_length=256,start_bpm=110,tightness=120,units='time')
tempo=float(np.atleast_1d(tempo)[0])
print("librosa tempo on render: %.2f BPM; preset tempo %.2f"%(tempo,preset["tempo"]))
bt=np.array(bt)
d=[]
for t in pb:
    j=np.argmin(np.abs(bt-t)); d.append(bt[j]-t)
d=np.array(d)
print("preset beats within 22 s: %d; detected beats: %d"%(len(pb),len(bt)))
print("preset-vs-detected beat offset (ms): median %.1f, mean %.1f, std %.1f, max|%.1f|"%(np.median(d)*1000,d.mean()*1000,d.std()*1000,np.max(np.abs(d))*1000))
# per-beat check around the suspicious 4.91/5.34/6.00
for t in [4.91,5.34,6.00,8.74,13.11,19.66]:
    j=np.argmin(np.abs(bt-t)); print("  preset %.2f -> nearest detected %.3f (%.0f ms)"%(t,bt[j],(bt[j]-t)*1000))
# onset strength at the beats: where is the true onset peak near preset times?
def onset_peak(t,w=0.12):
    i0=int((t-w)*sr/256); i1=int((t+w)*sr/256)+1
    seg=oenv[i0:i1]; k=np.argmax(seg); return (i0+k)*256/sr
print("onset-envelope peak near preset beats (ms offset):",{t:round((onset_peak(t)-t)*1000) for t in [0.56,1.09,1.64,2.19,6.56,7.09,7.64,8.19,8.74,9.29,10.93,13.11,17.47,19.66]})
# 3) SFX onsets in the render: high-pass >2.5 kHz envelope near scheduled starts
hp=signal.sosfilt(signal.butter(4,2500,btype='high',fs=sr,output='sos'),mix)
env=np.abs(signal.hilbert(hp)); env=signal.sosfilt(signal.butter(2,200,btype='low',fs=sr,output='sos'),env)
sched={"sfx-tile bong":0.26,"sfx-unit-first drop":6.52,"sfx-unit-last impactSoft":8.70,"sfx-click":11.43,"sfx-fill select":13.08,"sfx-lockup bell":19.62}
for n,t in sched.items():
    i0=int((t-0.15)*sr); i1=int((t+0.35)*sr)
    seg=env[i0:i1]; base=np.median(env[int((t-0.6)*sr):int((t-0.2)*sr)]) if t>0.8 else np.median(env[:int(0.2*sr)])
    k=np.argmax(seg); print("  %-26s scheduled %.2f  HF-peak at %.3f  (+%.0f ms)  peak/base = %.1f dB"%(n,t,(i0+k)/sr,((i0+k)/sr-t)*1000,20*np.log10((seg[k]+1e-9)/(base+1e-9))))
