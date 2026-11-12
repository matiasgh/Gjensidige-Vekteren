// The step 3 choices ("Hva er du opptatt av akkurat nå?"), in display order.
// The label is what gets stored in onboarding.priorities; the tip is shown in step 6.
export type Tip = { title: string; text: string; href: string }
export type PriorityOption = { label: string; tip: Tip }

const travelTip: Tip = {
  title: 'Husk reiseforsikring utenfor EU/EØS',
  text: 'Helsetrygdkortet gjelder ikke i for eksempel Thailand, og kredittkortets reiseforsikring har begrensninger.',
  href: 'https://www.gjensidige.no/godtforberedt/ferie-reise/kredittkortets-reiseforsikring',
}

export const priorityOptions: PriorityOption[] = [
  {
    label: 'Hus',
    tip: {
      title: 'Sjekk alderen på røykvarslerne',
      text: 'Røykvarslere bør byttes etter 8–10 år. Produksjonsdatoen står på baksiden.',
      href: 'https://www.gjensidige.no/godtforberedt/bolig-eiendom/roykvarsleren-gar-ut-pa-dato',
    },
  },
  {
    label: 'Hytte',
    tip: {
      title: 'Sjekk brannsikkerheten på hytta',
      text: 'Brannvesenet kommer ofte sent frem til hytter. Sørg for røykvarslere, slukkeutstyr og rømningsveier.',
      href: 'https://www.gjensidige.no/godtforberedt/bolig-eiendom/brannsikkerhet-er-like-viktig-pa-hytta',
    },
  },
  {
    label: 'Oppussing',
    tip: {
      title: 'Sjekk reglene før du river vegger',
      text: 'Bærevegger og brannceller krever ofte søknad til kommunen. Spør en fagperson før du starter.',
      href: 'https://www.gjensidige.no/godtforberedt/bolig-eiendom/store-oppussingsplaner-sjekk-dette-forst',
    },
  },
  {
    label: 'Bil',
    tip: {
      title: 'Velg vinterdekk etter hvordan du kjører',
      text: 'Ingen dekk er best på alt. Les dekktestene, men la føret du oftest kjører på styre valget.',
      href: 'https://www.gjensidige.no/godtforberedt/bil-kjoretoy/slik-velger-du-vinterdekk',
    },
  },
  {
    label: 'Motorsykkel, moped eller el-sykkel',
    tip: {
      title: 'Lås kjøretøyet godt',
      text: 'Bare rundt 1 av 10 tyverier av motorsykler og mopeder blir oppklart. Bruk rattlås og en ekstra lås.',
      href: 'https://www.gjensidige.no/godtforberedt/bil-kjoretoy/tyveri-av-motorsykkel',
    },
  },
  {
    label: 'Båt',
    tip: {
      title: 'Unngå de vanligste båtskadene',
      text: 'Påkjørsel av gjenstander i sjøen og synking er blant de vanligste skadene. Se hvordan du unngår dem.',
      href: 'https://www.gjensidige.no/godtforberedt/bat/dette-er-de-vanligste-batskadene',
    },
  },
  {
    label: 'Familie',
    tip: {
      title: 'Forsikre barna tidlig',
      text: 'Helseerklæringen er enklere for små barn, og deler av barneforsikringen følger med når barnet blir voksent.',
      href: 'https://www.gjensidige.no/godtforberedt/helse-livsstil/derfor-bor-du-forsikre-barnet-tidlig',
    },
  },
  {
    label: 'Kjæledyr',
    tip: {
      title: 'Lær deg en enkel helsesjekk',
      text: 'Da ser du raskere om hunden eller katten er syk. Sjekk øyne, ører, tenner og pels.',
      href: 'https://www.gjensidige.no/godtforberedt/dyr/enkel-helsesjekk-av-hund-og-katt--dette-klarer-du-selv',
    },
  },
  {
    label: 'Helse',
    tip: {
      title: 'Forebygg vondt i ryggen',
      text: 'Halvparten av oss har hatt ryggsmerter det siste året. Enkle øvelser over tid kan hindre at det kommer tilbake.',
      href: 'https://www.gjensidige.no/godtforberedt/helse-livsstil/fire-ovelser-forebygge-ryggsmerter',
    },
  },
  {
    label: 'Økonomi',
    tip: {
      title: 'Gå gjennom forsikringene dine',
      text: 'Er du dobbeltforsikret, kjører mindre enn før eller har pusset opp, kan det være penger å spare.',
      href: 'https://www.gjensidige.no/godtforberedt/okonomi/slik-kan-du-spare-penger-pa-forsikring',
    },
  },
  {
    label: 'Sykdom',
    tip: {
      title: 'Tenk på økonomien hvis du blir syk',
      text: 'Tjener du over 6 G, dekker ikke folketrygden hele lønnen når du er sykmeldt. Sjekk hva du har via jobben.',
      href: 'https://www.gjensidige.no/godtforberedt/helse-livsstil/alvorlig-syk-og-okonomi',
    },
  },
  {
    label: 'Pensjon',
    tip: {
      title: 'Sjekk pensjonen når du bytter jobb',
      text: 'Pensjonen er den fremtidige lønnen din. Noen prosent mer i sparing kan utgjøre store forskjeller over tid.',
      href: 'https://www.gjensidige.no/godtforberedt/okonomi/pensjon/pensjon-ved-bytte-av-jobb',
    },
  },
  {
    label: 'Sparing',
    tip: {
      title: 'Kom i gang med fondssparing',
      text: 'Tenk først på hva pengene skal brukes til. Med lang tid øker sjansen for avkastning, selv om markedet svinger.',
      href: 'https://www.gjensidige.no/godtforberedt/okonomi/slik-kommer-du-i-gang-med-fondssparing',
    },
  },
  { label: 'Reise', tip: travelTip },
  {
    label: 'Forebygging',
    tip: {
      title: 'Vurder en vannstopper',
      text: 'Vannskader topper skadestatistikken. En lekkasjesikring stenger vannet før skaden blir stor.',
      href: 'https://www.gjensidige.no/godtforberedt/bolig-eiendom/ingen-vannskader-etter-lekkasjesikringssystem',
    },
  },
]

export const priorityLabels = priorityOptions.map(({ label }) => label)

// Shown when the customer chose fewer than three options.
export const generalTips: Tip[] = [
  {
    title: 'Husk å finne stoppekranen',
    text: 'Da stopper du en vannlekkasje raskere. Kranen under kjøkkenbenken stenger ofte bare oppvaskmaskinen.',
    href: 'https://www.gjensidige.no/godtforberedt/bolig-eiendom/vet-du-hvor-stoppekranen-er',
  },
  {
    title: 'Husk å stenge utekranen før frosten',
    text: 'En frostskade koster i snitt over 100 000 kroner.',
    href: 'https://www.gjensidige.no/godtforberedt/bolig-eiendom/husk-a-stenge-utekranen-for-frosten-kommer',
  },
  travelTip,
]

export const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

/** The chosen options in list order, ignoring free text and unknown labels. */
export const chosenOptions = (priorities: string[]) => priorityOptions.filter(({ label }) => priorities.includes(label))

/** Tips for the chosen options first (in list order), topped up with general tips, without duplicate links. */
export function tipsFor(priorities: string[], count = 3): (Tip & { reason?: string })[] {
  const picked: (Tip & { reason?: string })[] = chosenOptions(priorities).map(({ label, tip }) => ({ ...tip, reason: `Fordi du har valgt ${lowerFirst(label)}` }))
  for (const tip of generalTips) if (!picked.some(({ href }) => href === tip.href)) picked.push(tip)
  return picked.slice(0, count)
}
