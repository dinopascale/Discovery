# MtgDiscovery

Questa app cerca di risolvere l'annoso problema per ogni giocatore di (Magic: The Gathering)[https://it.wikipedia.org/wiki/Magic:_l%27Adunanza] (italiano al momento) di trovare in modo rapido e semplice tutti i Preliminary Pro Tour Qualifiers (PPTQs) più vicini a sè

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

**Particolari tecnologie usate**

Come detto ho deciso volontariamente di non usare tecnologie avanzate, divertendomi con Vanilla JS e la sintassi ES6 e cercando quanto più possibile di usufruire delle nuove funzionalità a disposizione (come ad esempio Class, arrow function e uso estensivo di let e const). Per le chiamate asincrone rivolte al recupero dei dati essenziali per il funzionamento di Mtg Discovery, ho utilizzato **fetch**, mentre per alcune operazioni più dispendiose sul piano di memoria ho deciso di utilizzare funzioni asincrone con la tecnologia dalle **Promise**.

Per quanto riguarda il *Caching* dei dati e per diminuire il numero di chiamate AJAX ho utilizzato l'IndexedDB, il moderno tool per la memorizzazione su lato client dei dati delle webapps.Per non perdermi nell'intricata API ho deciso di avvalermi di [Localforage](https://github.com/localForage/localForage), una libreria davvero potente e semplicissima da utilizzare.

Per quanto riguarda la mappa ho utilizzato a piene mani l'API di Google Maps per JS

Per la gestione dei diversi moduli e dei file ho usato Webpack

### Demo funzionante

La demo della webapp funzionante si può trovare su [Mtg Discovery](http://dinopascale.altervista.org/mtgdiscovery2/)

Il progetto non è esente da problemi e bug (conosciuti e non) e sicuramente potrebbe essere ottimizzata. Infatti il prossimo passo sarà quello di riprendere in mano il codice e la struttura base del software e re-implementarla con le moderne tecnologie front-end che ho deciso di non utilizzare in questa prima versione di Mtg Discovery
