/**
 * Silhouette.jsx
 * SVG silhouette overlays for night/day phase backgrounds.
 */

/**
 * Night: Village silhouette in dark purple-navy tones.
 * Same shape as DaySilhouette but adapted for the dark night background.
 */
export function NightSilhouette() {
  return (
    <svg
      className="silhouette silhouette-night"
      viewBox="0 0 1440 200"
      preserveAspectRatio="xMidYMax meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Far background buildings (very subtle, distant) */}
      <g opacity="0.25" fill="#130f22">
        <rect x="50" y="140" width="60" height="60" />
        <polygon points="42,143 80,118 118,143" />
        <rect x="200" y="148" width="50" height="52" />
        <polygon points="192,151 225,128 258,151" />
        <rect x="500" y="138" width="70" height="62" />
        <polygon points="492,141 535,112 578,141" />
        <rect x="900" y="145" width="55" height="55" />
        <polygon points="893,148 927,122 962,148" />
        <rect x="1250" y="140" width="65" height="60" />
        <polygon points="1242,143 1282,115 1322,143" />
      </g>

      {/* ── DARK mauve-gray: Churches, Inn, Town hall ── */}
      <g fill="#090714">
        {/* Church with steeple — left */}
        <rect x="0" y="120" width="80" height="80" />
        <polygon points="-5,123 40,88 85,123" />
        <rect x="30" y="88" width="20" height="38" />
        <polygon points="40,70 45,55 50,70" />
        <rect x="10" y="140" width="18" height="25" />
        <rect x="50" y="140" width="18" height="18" />

        {/* Inn / larger building */}
        <rect x="298" y="118" width="90" height="82" />
        <polygon points="290,121 343,90 396,121" />
        <rect x="315" y="140" width="20" height="28" />
        <rect x="355" y="140" width="20" height="20" />
        <rect x="315" y="115" width="10" height="10" />
        <rect x="352" y="112" width="10" height="10" />
        <rect x="330" y="130" width="26" height="10" />

        {/* Town hall — center */}
        <rect x="558" y="105" width="110" height="95" />
        <polygon points="548,108 613,70 678,108" />
        <rect x="598" y="70" width="30" height="40" />
        <polygon points="613,55 620,40 627,55" />
        <rect x="580" y="130" width="22" height="30" />
        <rect x="615" y="130" width="22" height="22" />
        <rect x="650" y="130" width="16" height="22" />
        <rect x="583" y="108" width="14" height="14" />
        <rect x="615" y="108" width="14" height="14" />
        <rect x="647" y="108" width="14" height="14" />

        {/* Tree cluster */}
        <rect x="776" y="155" width="8" height="45" />
        <ellipse cx="780" cy="145" rx="24" ry="28" />
        <rect x="798" y="162" width="7" height="38" />
        <ellipse cx="801" cy="153" rx="18" ry="22" />

        {/* Church — right side */}
        <rect x="1048" y="118" width="75" height="82" />
        <polygon points="1040,121 1085,90 1130,121" />
        <rect x="1072" y="90" width="26" height="35" />
        <polygon points="1085,74 1091,58 1097,74" />
        <rect x="1055" y="140" width="18" height="24" />
        <rect x="1082" y="140" width="18" height="18" />
        <rect x="1110" y="140" width="14" height="18" />

        {/* Large end house — far right */}
        <rect x="1360" y="125" width="80" height="75" />
        <polygon points="1353,128 1400,95 1447,128" />
        <rect x="1372" y="148" width="20" height="30" />
        <rect x="1402" y="148" width="18" height="18" />

        {/* Ground strip */}
        <rect x="0" y="196" width="1440" height="10" />
      </g>

      {/* ── MEDIUM mauve-gray: Townhouses, Bakery, Right houses ── */}
      <g fill="#130f20">
        {/* Row of connected townhouses */}
        <rect x="88" y="135" width="45" height="65" />
        <polygon points="82,138 110,115 138,138" />
        <rect x="133" y="140" width="42" height="60" />
        <polygon points="128,143 154,122 180,143" />
        <rect x="178" y="130" width="50" height="70" />
        <polygon points="171,133 203,105 235,133" />
        <rect x="195" y="94" width="8" height="14" />
        <rect x="225" y="100" width="6" height="10" />

        {/* Bakery */}
        <rect x="420" y="138" width="55" height="62" />
        <polygon points="413,141 447,118 481,141" />
        <rect x="435" y="158" width="16" height="22" />
        <rect x="455" y="158" width="14" height="14" />
        <rect x="431" y="132" width="8" height="12" />

        {/* Right side houses */}
        <rect x="672" y="130" width="52" height="70" />
        <polygon points="665,133 698,108 731,133" />
        <rect x="680" y="152" width="16" height="24" />
        <rect x="704" y="152" width="14" height="16" />

        <rect x="726" y="142" width="48" height="58" />
        <polygon points="719,145 750,120 781,145" />
        <rect x="733" y="160" width="14" height="22" />
        <rect x="754" y="160" width="14" height="14" />

        {/* More village */}
        <rect x="870" y="125" width="65" height="75" />
        <polygon points="863,128 902,98 941,128" />
        <rect x="880" y="148" width="18" height="28" />
        <rect x="907" y="148" width="16" height="18" />
        <rect x="886" y="120" width="10" height="10" />
        <rect x="905" y="120" width="10" height="10" />
        <rect x="920" y="90" width="8" height="12" />

        {/* Houses mid-right */}
        <rect x="1182" y="140" width="55" height="60" />
        <polygon points="1175,143 1209,115 1243,143" />
        <rect x="1192" y="160" width="16" height="22" />
        <rect x="1215" y="160" width="14" height="14" />

        <rect x="1308" y="138" width="50" height="62" />
        <polygon points="1301,141 1333,115 1365,141" />
        <rect x="1318" y="160" width="14" height="22" />
        <rect x="1338" y="160" width="14" height="14" />
      </g>

      {/* ── LIGHT mauve-gray: Fences, Trees, Other houses ── */}
      <g fill="#1e1a2c">
        {/* Fence/wall */}
        <rect x="228" y="165" width="70" height="35" />
        <rect x="233" y="158" width="4" height="10" />
        <rect x="245" y="158" width="4" height="10" />
        <rect x="257" y="158" width="4" height="10" />
        <rect x="269" y="158" width="4" height="10" />
        <rect x="281" y="158" width="4" height="10" />

        {/* Tree */}
        <rect x="395" y="155" width="8" height="45" />
        <ellipse cx="399" cy="148" rx="22" ry="26" />
        <ellipse cx="390" cy="158" rx="14" ry="18" />
        <ellipse cx="408" cy="160" rx="14" ry="16" />

        {/* More houses */}
        <rect x="478" y="128" width="60" height="72" />
        <polygon points="470,131 508,100 546,131" />
        <rect x="490" y="148" width="16" height="26" />
        <rect x="514" y="148" width="16" height="18" />
        <rect x="504" y="120" width="8" height="12" />

        {/* Another tree */}
        <rect x="541" y="160" width="7" height="40" />
        <ellipse cx="544" cy="152" rx="18" ry="22" />

        {/* More village smaller */}
        <rect x="812" y="135" width="55" height="65" />
        <polygon points="805,138 839,112 873,138" />
        <rect x="820" y="155" width="16" height="24" />
        <rect x="844" y="155" width="14" height="16" />

        {/* Houses */}
        <rect x="938" y="138" width="50" height="62" />
        <polygon points="931,141 963,115 995,141" />
        <rect x="948" y="160" width="14" height="22" />
        <rect x="968" y="160" width="14" height="14" />

        {/* Fence right */}
        <rect x="990" y="168" width="55" height="32" />
        <rect x="994" y="160" width="4" height="10" />
        <rect x="1006" y="160" width="4" height="10" />
        <rect x="1018" y="160" width="4" height="10" />
        <rect x="1030" y="160" width="4" height="10" />

        {/* Houses far right */}
        <rect x="1128" y="133" width="52" height="67" />
        <polygon points="1121,136 1154,110 1187,136" />
        <rect x="1136" y="155" width="16" height="24" />
        <rect x="1158" y="155" width="14" height="16" />

        <rect x="1240" y="128" width="65" height="72" />
        <polygon points="1232,131 1272,100 1312,131" />
        <rect x="1252" y="150" width="18" height="28" />
        <rect x="1278" y="150" width="16" height="18" />
        <rect x="1258" y="122" width="10" height="10" />
        <rect x="1282" y="122" width="10" height="10" />
      </g>

    </svg>
  )
}

/** Day: Rolling European village rooftops */
export function DaySilhouette() {
  return (
    <svg
      className="silhouette silhouette-day"
      viewBox="0 0 1440 200"
      preserveAspectRatio="xMidYMax meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Far mid buildings (lighter) */}
      <g opacity="0.2" fill="#3d2a10">
        <rect x="50" y="140" width="60" height="60" />
        <polygon points="42,143 80,118 118,143" />
        <rect x="200" y="148" width="50" height="52" />
        <polygon points="192,151 225,128 258,151" />
        <rect x="500" y="138" width="70" height="62" />
        <polygon points="492,141 535,112 578,141" />
        <rect x="900" y="145" width="55" height="55" />
        <polygon points="893,148 927,122 962,148" />
        <rect x="1250" y="140" width="65" height="60" />
        <polygon points="1242,143 1282,115 1322,143" />
      </g>

      {/* Foreground village */}
      <g fill="#2a1a06">
        {/* Church with steeple on left */}
        <rect x="0" y="120" width="80" height="80" />
        <polygon points="-5,123 40,88 85,123" />
        <rect x="30" y="88" width="20" height="38" />
        <polygon points="40,70 45,55 50,70" />
        <rect x="10" y="140" width="18" height="25" />
        <rect x="50" y="140" width="18" height="18" />

        {/* Row of connected townhouses */}
        <rect x="88" y="135" width="45" height="65" />
        <polygon points="82,138 110,115 138,138" />
        <rect x="133" y="140" width="42" height="60" />
        <polygon points="128,143 154,122 180,143" />
        <rect x="178" y="130" width="50" height="70" />
        <polygon points="171,133 203,105 235,133" />
        {/* chimney */}
        <rect x="195" y="94" width="8" height="14" />
        <rect x="225" y="100" width="6" height="10" />

        {/* Gap with fence/wall */}
        <rect x="228" y="165" width="70" height="35" />
        <rect x="233" y="158" width="4" height="10" />
        <rect x="245" y="158" width="4" height="10" />
        <rect x="257" y="158" width="4" height="10" />
        <rect x="269" y="158" width="4" height="10" />
        <rect x="281" y="158" width="4" height="10" />

        {/* Inn / larger building */}
        <rect x="298" y="118" width="90" height="82" />
        <polygon points="290,121 343,90 396,121" />
        <rect x="315" y="140" width="20" height="28" />
        <rect x="355" y="140" width="20" height="20" />
        <rect x="315" y="115" width="10" height="10" />
        <rect x="352" y="112" width="10" height="10" />
        {/* sign */}
        <rect x="330" y="130" width="26" height="10" />

        {/* Tree */}
        <rect x="395" y="155" width="8" height="45" />
        <ellipse cx="399" cy="148" rx="22" ry="26" />
        <ellipse cx="390" cy="158" rx="14" ry="18" />
        <ellipse cx="408" cy="160" rx="14" ry="16" />

        {/* Bakery */}
        <rect x="420" y="138" width="55" height="62" />
        <polygon points="413,141 447,118 481,141" />
        <rect x="435" y="158" width="16" height="22" />
        <rect x="455" y="158" width="14" height="14" />
        <rect x="431" y="132" width="8" height="12" />

        {/* More houses */}
        <rect x="478" y="128" width="60" height="72" />
        <polygon points="470,131 508,100 546,131" />
        <rect x="490" y="148" width="16" height="26" />
        <rect x="514" y="148" width="16" height="18" />
        <rect x="504" y="120" width="8" height="12" />

        {/* Another tree */}
        <rect x="541" y="160" width="7" height="40" />
        <ellipse cx="544" cy="152" rx="18" ry="22" />

        {/* Town hall / larger center building */}
        <rect x="558" y="105" width="110" height="95" />
        <polygon points="548,108 613,70 678,108" />
        <rect x="598" y="70" width="30" height="40" />
        <polygon points="613,55 620,40 627,55" />
        <rect x="580" y="130" width="22" height="30" />
        <rect x="615" y="130" width="22" height="22" />
        <rect x="650" y="130" width="16" height="22" />
        <rect x="583" y="108" width="14" height="14" />
        <rect x="615" y="108" width="14" height="14" />
        <rect x="647" y="108" width="14" height="14" />

        {/* Right side houses */}
        <rect x="672" y="130" width="52" height="70" />
        <polygon points="665,133 698,108 731,133" />
        <rect x="680" y="152" width="16" height="24" />
        <rect x="704" y="152" width="14" height="16" />

        <rect x="726" y="142" width="48" height="58" />
        <polygon points="719,145 750,120 781,145" />
        <rect x="733" y="160" width="14" height="22" />
        <rect x="754" y="160" width="14" height="14" />

        {/* Tree cluster */}
        <rect x="776" y="155" width="8" height="45" />
        <ellipse cx="780" cy="145" rx="24" ry="28" />
        <rect x="798" y="162" width="7" height="38" />
        <ellipse cx="801" cy="153" rx="18" ry="22" />

        {/* More village */}
        <rect x="812" y="135" width="55" height="65" />
        <polygon points="805,138 839,112 873,138" />
        <rect x="820" y="155" width="16" height="24" />
        <rect x="844" y="155" width="14" height="16" />

        <rect x="870" y="125" width="65" height="75" />
        <polygon points="863,128 902,98 941,128" />
        <rect x="880" y="148" width="18" height="28" />
        <rect x="907" y="148" width="16" height="18" />
        <rect x="886" y="120" width="10" height="10" />
        <rect x="905" y="120" width="10" height="10" />
        {/* chimney */}
        <rect x="920" y="90" width="8" height="12" />

        <rect x="938" y="138" width="50" height="62" />
        <polygon points="931,141 963,115 995,141" />
        <rect x="948" y="160" width="14" height="22" />
        <rect x="968" y="160" width="14" height="14" />

        {/* Fence */}
        <rect x="990" y="168" width="55" height="32" />
        <rect x="994" y="160" width="4" height="10" />
        <rect x="1006" y="160" width="4" height="10" />
        <rect x="1018" y="160" width="4" height="10" />
        <rect x="1030" y="160" width="4" height="10" />

        {/* Church right side */}
        <rect x="1048" y="118" width="75" height="82" />
        <polygon points="1040,121 1085,90 1130,121" />
        <rect x="1072" y="90" width="26" height="35" />
        <polygon points="1085,74 1091,58 1097,74" />
        <rect x="1055" y="140" width="18" height="24" />
        <rect x="1082" y="140" width="18" height="18" />
        <rect x="1110" y="140" width="14" height="18" />

        {/* Final houses right */}
        <rect x="1128" y="133" width="52" height="67" />
        <polygon points="1121,136 1154,110 1187,136" />
        <rect x="1136" y="155" width="16" height="24" />
        <rect x="1158" y="155" width="14" height="16" />

        <rect x="1182" y="140" width="55" height="60" />
        <polygon points="1175,143 1209,115 1243,143" />
        <rect x="1192" y="160" width="16" height="22" />
        <rect x="1215" y="160" width="14" height="14" />

        <rect x="1240" y="128" width="65" height="72" />
        <polygon points="1232,131 1272,100 1312,131" />
        <rect x="1252" y="150" width="18" height="28" />
        <rect x="1278" y="150" width="16" height="18" />
        <rect x="1258" y="122" width="10" height="10" />
        <rect x="1282" y="122" width="10" height="10" />

        <rect x="1308" y="138" width="50" height="62" />
        <polygon points="1301,141 1333,115 1365,141" />
        <rect x="1318" y="160" width="14" height="22" />
        <rect x="1338" y="160" width="14" height="14" />

        <rect x="1360" y="125" width="80" height="75" />
        <polygon points="1353,128 1400,95 1447,128" />
        <rect x="1372" y="148" width="20" height="30" />
        <rect x="1402" y="148" width="18" height="18" />

        {/* Ground strip */}
        <rect x="0" y="196" width="1440" height="10" />
      </g>
    </svg>
  )
}
