# MtgDiscovery

Questa app cerca di risolvere l'annoso problema per ogni giocatore di [Magic: The Gathering](https://it.wikipedia.org/wiki/Magic:_l%27Adunanza)(italiano al momento) di trovare in modo rapido e semplice tutti i Preliminary Pro Tour Qualifiers (PPTQs) più vicini a sè

## Architettura software

Le tecnologie usate per sviluppare Mtg Discovery sono:

- HTML5
- CSS3
- Vanilla JS
- Python

Perchè non ho usato nessuno framework frontend (Bootstrap, Vue/React/Angular/Jquery)? Per una sola semplice ragione: mettermi alla prova. Con Mtg Discovery volevo testare non tanto la mia capacità di padroneggiare una particolare tecnologia, ma la mia comprensione di quello che è alla base del lavoro di developer frontend. Ho deciso quindi di concentrarmi sull'architettura software del progetto e studiare i diversi pattern alla base delle moderne webapp, lasciando quindi alla 'sacra terna' HTML/CSS/JS il lato tecnico di Mtg Discovery.

Il pattern che ho alla fine deciso di usare è simile a quello introdotto dai moderni framework js e basato sull'uso di componenti quanto più indipendenti e riusabili all'interno di diversi punti all'interno dell'applicazione. Per quanto riguarda invece la 'comunicazione' fra i diversi componenti ho deciso di usare un pattern simile al 'Observer pattern' con qualche differenza.

**Action e Listener**

Il cervello e cuore dell'app è il *Bridge* , dove viene gestita la logica di business di Mtg Discovery. Qui viene conservato il registro di tutti i Listeners dell'app e l'unico dato atomico e non riconducibile ad altri: l'input (posizione) inserito dall'utente.

Ogni componente si registra al *Bridge* durante la propria fase di inizializzazione specificando a quale tipo di evento è interessato e per il quale dovrà aggiornare la propria view. Il registro dei Listeners è quindi una collezione delle referenze dei diversi componenti suddivisi e catalogati in base all'evento che hanno deciso di ascoltare.

La comunicazione con il *Bridge* si articola dunque in due momenti: i componenti, attraverso la loro view, reagiscono alle azioni dell'utente inviando una determinata **ACTION** al Bridge. Questa è un Object con due valori:

- typeOfAction
- payload (opzionale)

la prima definisce il tipo di evento scatenante, mentre la seconda invia il facoltativo carico di dati necessari a compiere l'operazione richiesta. Il *Bridge*, attraverso uno switch basato sul tipo di **Action**, interpreta il comando ricevuto e chiama le conseguenti funzioni interne per eventuali elaborazioni dei dati contenuti nel *payload*. Alla fine di questo processo il Bridge notifica a tutti i Listeners in ascolto per il particolare evento indicato dalla typeOfAction di aggiornare la propria view nel modo che più ritengono opportuno e che è indicato dal metodo **notify** che ogni componente/Listener ha definito al suo interno.

**Struttura dei dati**

Mtg Discovery ha bisogno principalmente di due tipi di dati per funzionare: la lista dei comuni italiani con relative informazioni per la geolocalizzazione e la lista dei tornei per la stagione corrente (di durata di 3 mesi). I primi dati li ho recuperati attraverso questo [file json](https://github.com/matteocontrini/comuni-jsonv) ed elaborati con un piccolo script **python** per ottenere solo le informazioni necessarie (nome del comune e provincia) e a cui aggiungere le informazioni per la geolocalizzazione. 

Per il secondo set di dati (lista dei tornei) ho programmato un web scraper (sempre in python) con cui recuperare i dati pubblici dall'[*event locator* ufficiale](http://locator.wizards.com/) e riorganizzarli in un json pronto all'utilizzo.

**Caching e Offline Storage**

Mtg Discovery nel suo funzionamento base richiede per prima cosa all'user di inserire la propria posizione geografica. La webapp quindi aspetta che l'utente finisca di inserire il proprio input e fa quindi una chiamata ajax per recuperate la lista dei comuni e cercare quello inserito dall'utente. Qui mi si è presentato il primo problema: il json dei comuni italiani è particolarmente corposo (quasi 8000 campi) e poco prono quindi a continui download soprattutto se l'operazione viene richiesta in condizioni precarie di rete come nel caso di dispositivi mobile. Inoltre è un file che difficilmente necessita di continui aggiornamenti e sincronizzazioni in real time. Per questo motivo ho deciso di utilizzare la modern API **IndexedDB** per la memorizzazione su lato client e offline storage e la libreria [Localforage](https://github.com/localForage/localForage) per interfacciarmi con essa in modo semplice e potente. In questo modo dopo un iniziale download l'applicazione avrebbe, nei successivi utilizzi, usato solamente i dati contenuti sul mobile, **eliminando** del tutto le chiamate AJAX. 
Il problema però continuava a perseguitare la webapp nella forma del primo corpossisimo download di tutto il file dei comuni italiani, operazione lunga in contesti mobile e che rendeva praticamente inutile Mtg Discovery per troppi secondi dal suo avvio. 

La sooluzione finale è stata quella di lavorare quindi sulla forma dei dati: ho deciso infatti di spacchettare l'unico file dei comuni in 26 file più piccoli ognuno dei quali contrassegnato da una diversa lettera dell'alfabeto e indicante l'iniziale dei comuni che conteneva. In questo modo ho ottenuto 26 JSON diversi, di dimensione massima 100Kb e, soprattutto, specifici per la ricerca dell'utente.

In questo modo infatti, Mtg Discovery, una volta che l'utente ha finito di inserire la sua città controlla l'iniziale dell'input e controlla se il file è inserito nell' IndexedDB. In caso positivo i dati vengono recuperati e si prosegue con una semplice ricerca. In caso negativo viene fatta una chiamata AJAX per il recupero del **solo** json necessario e non di tutto il file. Questa soluzione permette all'app di fare meno chiamate AJAX e di scaricare file più piccoli e adatti ad un mondo mobile.

**Particolari tecnologie usate**

Come detto ho deciso volontariamente di non usare tecnologie avanzate, divertendomi con Vanilla JS e la sintassi ES6 e cercando quanto più possibile di usufruire delle nuove funzionalità a disposizione (come ad esempio Class, arrow function e uso estensivo di let e const). Per le chiamate asincrone rivolte al recupero dei dati essenziali per il funzionamento di Mtg Discovery, ho utilizzato **fetch**, mentre per alcune operazioni più dispendiose sul piano di memoria ho deciso di utilizzare funzioni asincrone con la tecnologia dalle **Promise**.

Per quanto riguarda la mappa ho utilizzato a piene mani l'API di Google Maps per JS ed in particolare la [Distance Matrix](https://developers.google.com/maps/documentation/distance-matrix/) per il calcolo del tempo necessario a coprire la distanza fra l'evento visualizzato e la propria posizione.

Per la gestione dei diversi moduli e dei file dell'app ho usato Webpack.

**Web Scraper**

### Demo funzionante

La demo della webapp funzionante si può trovare su [Mtg Discovery](http://dinopascale.altervista.org/mtgdiscovery2/)

Il progetto non è esente da problemi e bug (conosciuti e non) e sicuramente potrebbe essere ottimizzata. Infatti il prossimo passo sarà quello di riprendere in mano il codice e la struttura base del software e re-implementarla con le moderne tecnologie front-end che ho deciso di non utilizzare in questa prima versione di Mtg Discovery
