// Manually curated summaries of public Gjensidige product pages, not complete
// policy terms. Product availability does not imply customer ownership.
const checkedOn = '2026-11-11'

const productSources = {
  car: 'https://www.gjensidige.no/forsikring/bilforsikring',
  contents: 'https://www.gjensidige.no/forsikring/innboforsikring',
  travel: 'https://www.gjensidige.no/forsikring/reiseforsikring',
  travelExtension: 'https://www.gjensidige.no/forsikring/reiseforsikring/reisedager',
  child: 'https://www.gjensidige.no/forsikring/barneforsikring',
  life: 'https://www.gjensidige.no/forsikring/personforsikring/livsforsikring',
  building: 'https://www.gjensidige.no/forsikring/boligforsikring/husforsikring',
}

export const catalogueMetadata = {
  checkedOn,
  basis: 'Manuelt oppsummerte offentlige produktsider fra Gjensidige Norge',
  limitations:
    'Forenklede, ufullstendige produktopplysninger, ikke kundens fullstendige vilkår eller en bindende dekningsvurdering. Kundens forsikringsbevis og fullstendige avtalevilkår gjelder. Manglende dekning i sammendraget betyr ikke at den er unntatt.',
}

const travelCommon = {
  sources: [productSources.travel, productSources.travelExtension],
  checkedOn,
  includes: [
    'Lege- og sykehusutgifter ved uventet og akutt sykdom eller skade på reise',
    'Hjemreise og evakuering i beskrevne situasjoner, etter forhåndsgodkjenning fra alarmsentralen',
    'Avbestilling blant annet ved sykdom hos deg, nærmeste familie eller eneste reisefølge, med nærmere vilkår',
    'Tyveri av bagasje og skader ved de beskrevne hendelsene, for eksempel brann',
    'Knust mobilskjerm og tyveri av mobiltelefon',
    'Forsinket bagasje og forsinkelse etter nærmere vilkår',
    'Ansvar og rettshjelp utenfor Norden',
  ],
  exclusionsAndConditions: [
    'Gjelder fra du drar hjemmefra, også på småturer uten overnatting',
    'Skader i eget hjem, på arbeids-/studiested eller i barnehage er unntatt',
    'Forsikringen må kjøpes før reisen begynner; egne regler gjelder for avbestilling av allerede bestilte reiser',
    'Kjent sykdom/skade som krever behandling eller videre utredning er unntatt',
    'Uhellsskade på ting er unntatt, med unntak for mobilskjerm. Mistede eller gjenglemte briller erstattes ikke',
    'Land/områder med reiseadvarsel fra UD er unntatt som utgangspunkt; eventuell utvidelse krever individuell vurdering',
    'Egne begrensninger gjelder blant annet luftsport, boksing, dykking dypere enn 40 meter og ekspedisjoner',
    'Krav til bosted i Norge og medlemskap i folketrygden gjelder; langvarige utenlandsopphold må avklares særskilt',
  ],
  familyEligibility: [
    'Kan velges for én person eller familie; familie er ikke et eget produktnivå',
    'Familie omfatter forsikringstaker, ektefelle/samboer og barn under 21 år etter de oppgitte vilkårene',
    'Barn må bo i Norge og kan reise alene eller med andre; samboer og fosterbarn må ha samme folkeregistrerte adresse',
  ],
  tripDuration: {
    maxDays: 70,
    definition: 'Fra dagen du forlater hjemmet til dagen du er tilbake',
    extension: 'Ekstra reisedager kan kjøpes for én sammenhengende reise og må kjøpes før avreise, ikke underveis. Kontakt kundeservice for pris og avtale.',
    overlongTrip: 'Ikke bekreft at de første 70 dagene av en planlagt lengre reise er dekket uten å avklare fullstendige vilkår.',
  },
}

const childCommon = {
  sources: [productSources.child],
  checkedOn,
  purchaseAge: 'Fra 3 måneder til 16 år',
  includes: [
    '3 G ved utvalgte alvorlige sykdommer og skader, ikke enhver diagnose',
    'Opptil 25 G ved varig medisinsk invaliditet etter ulykke, avhengig av invaliditetsgrad',
    'Opptil 1 G i nødvendige behandlings- og reiseutgifter de første to årene etter ulykke; opptil 15 000 kr til privat behandling',
    'Opptil 4 G til forhåndsgodkjent ombygging av bolig etter sykdom eller ulykke',
    'Opptil 8 G ved økt pleie-/omsorgsbehov før 18 år, basert på vedtak fra NAV om hjelpestønad',
    '1 G ved dødsfall og dagpenger ved sykehusopphold etter nærmere vilkår',
    'Uførepensjon er inkludert i alle varianter, med ulik sum og varighet',
    'Helsehjelp 24/7 og aldersavhengige psykologtjenester',
  ],
  exclusionsAndConditions: [
    'Ingen egen utbetaling for medisinsk invaliditet etter sykdom; dette må ikke forveksles med ulykkesinvaliditet eller uførepensjon',
    'Helseerklæring kreves; vurderingen kan gi unntak, pristillegg eller avslag',
    'Kjøper må være forelder eller offentlig oppnevnt verge. Medisinsk utredning må være avsluttet før kjøp',
    'Behandlingsforsikring for barn er et eget tilvalg, ikke automatisk inkludert',
    'G er folketrygdens grunnbeløp og justeres årlig; ikke bruk en fast kroneverdi uten datert kilde',
    'Uførepensjon krever minst 50 % uførhet og innvilget AAP eller uføretrygd fra NAV. Utbetaling starter tidligst ved 18 år og graderes etter uføregrad',
  ],
  deductiblesNok: { homeAdaptation: 10000, accidentTreatment: 500, otherBaseBenefits: 0 },
}

const buildingCommon = {
  sources: [productSources.building],
  checkedOn,
  insuredObject: 'Bygningen og faste installasjoner, ikke løse eiendeler/innbo',
  includes: [
    'Brann-, vann- og naturskader på bygning og hageanlegg etter nærmere vilkår',
    'Fullverdigaranti og nytt hus ved totalskade etter nærmere vilkår',
    'Bekjempelse av mus og rotter samt skader de har forårsaket',
    'Skader på bygning/hage etter innbrudd, tyveri og hærverk',
    'Følgeskader på tilstøtende rom etter utett våtrom',
    'Ansvar som huseier, rettshjelp og mekling',
    'Helsehjelp 24/7',
  ],
  exclusionsAndConditions: [
    'Vedlikehold, slitasje, skadeforebyggende arbeid og skader oppstått før kjøp er ikke dekket',
    'Blant unntakene er setningsskader og skader som skyldes kjæledyr',
    'Løse eiendeler krever innboforsikring',
    'Avklar boligtype, eierskap og felles bygningsforsikring gjennom sameie/borettslag før anbefaling om kjøp',
    'Utleieforsikring og alarm er valgfrie tillegg, ikke automatisk inkludert',
  ],
  deductibles: {
    standardNok: 8000,
    selectableRangeNok: [8000, 20000],
    liabilityNok: 4000,
    legalAssistance: '4 000 kr pluss 20 % av kostnadene',
    naturalDamageNok: 8000,
  },
}

export const mockInsuranceCatalogue = {
  'car-kasko': {
    name: 'Bilforsikring – Kasko',
    sources: [productSources.car],
    checkedOn,
    includes: [
      'Ansvar for personskade og skade på andres kjøretøy, eiendom eller ting; rettshjelp etter nærmere vilkår',
      'Kollisjon, utforkjøring og hærverk på egen bil',
      'Glasskade, brann og tyveri',
      'Veihjelp uansett årsak, også hjemme og ved tomt batteri på elbil',
      'Personlige ting opptil 10 000 kr ved skadehendelser som forsikringen dekker',
      'Fastmontert ekstrautstyr opptil 50 000 kr ved skadehendelser som forsikringen dekker',
      'Mistet, stjålet eller skadet nøkkel opptil 7 500 kr, med 1 500 kr egenandel',
    ],
    optionalCoverage: {
      rentalCar: 'Leiebil opptil 30 dager ved dekket skade; kan velges bort. Kontroller kundens valg.',
      puncture: 'Punkteringsdekning kan velges, med egne krav til dekksjekk.',
    },
    exclusionsAndConditions: [
      'Gjelder i Europa, unntatt Russland, Belarus, Kosovo og land/områder med reiseadvarsel fra UD',
      'Rettshjelp gjelder ikke utenfor Norden',
      'Maskin- og elektronikkskadedekningen som beskrives for Pluss må ikke tilskrives Kasko',
      'Forsikringen følger bilen. Bruk av fører under 23 år må registreres, ellers kan egenandelen øke',
    ],
    deductibles: {
      collision: 'Valgt egenandel i kundens avtale; nettstedet oppgir standard 8 000 kr og valgmulighet 6 000–20 000 kr',
      fireAndTheftNok: 6000,
      glassRepairNok: 0,
      glassReplacementNok: 3000,
      roadsideAssistanceNok: 750,
      legalAssistance: '4 000 kr pluss 20 % av kostnadene',
    },
  },
  'contents-plus': {
    name: 'Innboforsikring – Innbo Pluss',
    sources: [productSources.contents],
    checkedOn,
    includes: [
      'Brann-, vann- og naturskade på innbo',
      'Tyveri blant annet fra bolig, tilknyttet bod/garasje, privat uteareal og låst garderobeskap; ran, overfall og veskenapping i Norden',
      'Uhellsskade hjemme og hvor som helst i verden; opptil 30 000 kr utenfor hjemmet',
      'Knust mobilskjerm for husstandens telefoner',
      'Sykkeltyveri opptil 30 000 kr per sykkel; kan utvides til 50 000 kr',
      'Privatansvar, rettshjelp, mekling, alternativt bosted ved dekket skade og hjelp ved ID-tyveri',
    ],
    exclusionsAndConditions: [
      'Bygning og faste bygningsdeler dekkes ikke av innboforsikringen',
      'Mistet/tapt gjenstand, ukjent skadeårsak, bruksslitasje og skader fra egne kjæledyr er unntatt',
      'Mobilforsikring for tap, tyveri og alle skader er et eget valgfritt tillegg',
      'Sykkel over 15 000 kr må ha FG-godkjent lås, unntatt når den er innelåst hjemme',
      'Husstands- og adressekrav gjelder for ektefelle/samboer, barn og andre husstandsmedlemmer; egne regler ved delt foreldreansvar og utdanning',
    ],
    deductibles: {
      standardNok: 3000,
      mobileScreenPartnerNok: 1000,
      mobileScreenOtherRepairerNok: 3000,
      naturalDamageNok: 8000,
      legalAssistance: '4 000 kr pluss 20 % av kostnadene',
    },
  },
  'travel-standard': {
    ...travelCommon,
    name: 'Reiseforsikring – Reise',
    limitsNok: { baggageTotal: 100000, valuables: 20000, delayedBaggage: 3000, missedTransport: 20000, cancellation: 50000 },
    deductibleNok: 1000,
  },
  'travel-plus': {
    ...travelCommon,
    name: 'Reiseforsikring – Reise Pluss',
    additionalBenefits: [
      'Heltids ulykkesforsikring, også utenom reise: opptil 300 000 kr ved medisinsk invaliditet, 100 000 kr ved dødsfall og opptil 15 000 kr til behandling etter hjemkomst, etter nærmere vilkår',
      'Dekning av fast egenandel ved skade/tyveri av leiebil eller leid motorsykkel på feriereise når kjøretøyet har påkrevd forsikring fra utleier',
    ],
    limitsNok: { valuables: 40000, delayedBaggage: 5000, missedTransport: 25000 },
    baggageAndCancellation: 'Ingen samlet maksgrense oppgitt for bagasje og avbestilling; særgrenser, dekkede hendelser og øvrige vilkår gjelder fortsatt',
    deductiblesNok: { general: 0, mobileTheftOrDamage: 1000 },
  },
  'child-basis': {
    ...childCommon,
    name: 'Barneforsikring – Basis',
    disabilityPension: '0,8 G per år i inntil 10 år fra barnet blir ufør, gradert etter uføregrad',
  },
  'child-medium': {
    ...childCommon,
    name: 'Barneforsikring – Medium',
    disabilityPension: '0,4 G per år frem til 67 år, gradert etter uføregrad',
  },
  'child-plus': {
    ...childCommon,
    name: 'Barneforsikring – Pluss',
    disabilityPension: '0,8 G per år frem til 67 år, gradert etter uføregrad',
  },
  life: {
    name: 'Livsforsikring',
    sources: [productSources.life],
    checkedOn,
    includes: ['Engangsutbetaling til etterlatte ved dødsfall som følge av sykdom eller ulykke før 80 år', 'Helsehjelp 24/7 for familien'],
    exclusionsAndConditions: [
      'Kan kjøpes mellom 16 og 75 år',
      'Helseerklæring kreves; vurderingen kan gi unntak, pristillegg eller avslag',
      'Pågående medisinsk utredning må være avsluttet før kjøp',
      'Forsikringssum og mottaker må avklares; ingen pris eller forsikringssum er fastsatt i katalogen',
      'Dette er ikke en uførepensjon; ikke presenter tjenester som en generell behandlingsforsikring',
    ],
  },
  building: { ...buildingCommon, name: 'Husforsikring – Hus' },
  'building-plus': {
    ...buildingCommon,
    name: 'Husforsikring – Hus Pluss',
    additionalBenefits: [
      'Innvendige følgeskader etter utett tak/vegg, men ikke reparasjon av selve taket/veggen',
      'Skade på våtrom og følgeskade av håndverksfeil i opptil 10 år etter arbeid fra autorisert håndverker, med krav om først å reklamere innen håndverkerens ansvarstid',
      'Råtesopp inne i huset og bekjempelse/skade fra skadeinsekter etter nærmere vilkår; kan velges som tillegg til Hus',
    ],
  },
}

export type MockCoverageId = keyof typeof mockInsuranceCatalogue

// Derived guidance, not quotations or independent policy terms.
export const mockCoverageInteractions = {
  basis: 'Veiledende scenarioer utledet fra de oppførte produktsidene, ikke bindende skadeoppgjør',
  checkedOn,
  generalRules: [
    'Vurder bare kundens aktive produkter og valgte tillegg. Tilgjengelige produkter i katalogen er ikke aktive.',
    'Ikke lov dobbelt erstatning for samme økonomiske tap eller legg sammen grenser. Samordning og egenandeler må vurderes etter kundens fullstendige vilkår.',
    'Skill erstatning for økonomisk tap fra avtalte personforsikringssummer. Ikke anta at en generell samordningsregel gjelder alle personutbetalinger.',
    'At et produkt eller en dekning mangler fra porteføljen beviser ikke at kunden er uforsikret gjennom andre selskaper, arbeidsgiver eller sameie.',
  ],
  scenarios: [
    {
      situation: 'Bagasje blir stjålet fra bil på reise',
      relevantCoverageIds: ['car-kasko', 'travel-standard', 'travel-plus', 'contents-plus'],
      sources: [productSources.car, productSources.travel, productSources.contents],
      explanation: 'Bil Kasko omfatter personlige ting opptil 10 000 kr ved dekkede hendelser. Reise kan også være relevant for bagasjen. Avklar hendelse, oppbevaring, sikkerhetskrav og fullstendige vilkår før dekning bekreftes; ikke finn på regler om låst bagasjerom eller anta at innbo alltid er utelukket utenfor boligen.',
    },
    {
      situation: 'Mobil eller briller blir skadet hjemme eller på reise',
      relevantCoverageIds: ['contents-plus', 'travel-standard', 'travel-plus'],
      sources: [productSources.contents, productSources.travel],
      explanation: 'Innbo Pluss har uhellsdekning hjemme og i verden, opptil 30 000 kr utenfor hjemmet, og særregler for mobilskjerm. Reise dekker knust mobilskjerm, men ikke generelle uhellsskader på ting, for eksempel briller som mistes i bakken. Skill uhellsskade fra tapt/gjenglemt gjenstand og kontroller egenandel og eventuelle tillegg.',
    },
    {
      situation: 'Et barn blir sykt før avreise eller under reisen',
      relevantCoverageIds: ['travel-standard', 'travel-plus', 'child-basis', 'child-medium', 'child-plus'],
      sources: [productSources.travel, productSources.child],
      explanation: 'Familiedekningen kan omfatte avbestilling og akutt sykdom på reise etter vilkårene. Dette betyr ikke at egen barneforsikring er kjøpt. Reise Pluss har også ulykkesdekning, men den må ikke likestilles med barneforsikringens sykdoms- og uføreytelser.',
    },
    {
      situation: 'Brann skader bygning, innbo og bil',
      relevantCoverageIds: ['building', 'building-plus', 'contents-plus', 'car-kasko'],
      sources: [productSources.building, productSources.contents, productSources.car],
      explanation: 'Skade på bygning, løse eiendeler og bil vurderes under sine respektive forsikringer. Hvis husforsikring ikke er oppført, spør om felles bygningsforsikring eller avtale annet sted; ikke konkluder med at bygningen er uforsikret. Samordning og egenandel må avklares i vilkårene.',
    },
    {
      situation: 'En sammenhengende reise varer i tre måneder',
      relevantCoverageIds: ['travel-standard', 'travel-plus'],
      sources: [productSources.travel, productSources.travelExtension],
      explanation: 'Tre måneder overstiger standardgrensen på 70 dager. Ekstra reisedager kan kjøpes for den konkrete reisen før avreise ved å kontakte kundeservice. Sjekk om kunden allerede har en utvidelse. Ikke bekreft at de første 70 dagene av en lengre planlagt reise dekkes uten avklaring av fullstendige vilkår.',
    },
  ],
}
