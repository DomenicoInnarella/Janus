import React from 'react';

interface JanusSplashGraphicProps {
  className?: string;
  animate?: boolean;
}

export const JanusSplashGraphic: React.FC<JanusSplashGraphicProps> = ({
  className = 'w-full max-w-sm aspect-square shadow-2xl rounded-2xl overflow-hidden',
}) => {
  return (
    <div className={`relative select-none ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        className="w-full h-full block"
      >
        {/* Outer Yellow Background */}
        <rect x="0" y="0" width="500" height="500" fill="#F9BC15" />

        {/* Outer Solid Black Frame */}
        <rect
          x="6"
          y="6"
          width="488"
          height="488"
          fill="none"
          stroke="#000000"
          strokeWidth="12"
        />

        {/* ================= TOP HEADER TEXT: JANUS ================= */}
        <text
          x="250"
          y="68"
          textAnchor="middle"
          fill="#000000"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Impact', 'Montserrat', 'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="52"
          letterSpacing="5"
        >
          JANUS
        </text>

        {/* ================= COLOSSEUM (LINE ART) ================= */}
        <g
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {/* Top Attic Cornice / Upper Wall Arc */}
          <path d="M 12 145 C 90 100, 240 92, 340 96 C 360 97, 420 105, 488 160" />
          <path d="M 12 153 C 90 108, 240 100, 340 104 C 360 105, 420 113, 488 168" />

          {/* Vertical Attic Pilasters (top band) */}
          <line x1="28" y1="135" x2="28" y2="150" />
          <line x1="52" y1="124" x2="52" y2="145" />
          <line x1="78" y1="117" x2="78" y2="140" />
          <line x1="108" y1="110" x2="108" y2="135" />
          <line x1="140" y1="104" x2="140" y2="132" />
          <line x1="172" y1="101" x2="172" y2="130" />
          <line x1="205" y1="99" x2="205" y2="128" />
          <line x1="238" y1="98" x2="238" y2="128" />
          <line x1="272" y1="99" x2="272" y2="128" />
          <line x1="305" y1="102" x2="305" y2="130" />

          {/* Middle Cornice Band 1 */}
          <path d="M 12 188 C 110 178, 250 175, 488 202" />
          <path d="M 12 196 C 110 186, 250 183, 488 210" />

          {/* TOP TIER ARCHES */}
          <path d="M 22 188 L 22 158 Q 34 148 46 158 L 46 188" fill="#F9BC15" />
          <path d="M 27 188 L 27 163 Q 34 154 41 163 L 41 188" fill="#000000" />

          <path d="M 54 184 L 54 152 Q 68 142 82 152 L 82 184" fill="#F9BC15" />
          <path d="M 60 184 L 60 157 Q 68 147 76 157 L 76 184" fill="#000000" />

          <path d="M 90 180 L 90 146 Q 106 136 122 146 L 122 180" fill="#F9BC15" />
          <path d="M 97 180 L 97 151 Q 106 141 115 151 L 115 180" fill="#000000" />

          <path d="M 130 178 L 130 142 Q 148 132 166 142 L 166 178" fill="#F9BC15" />
          <path d="M 138 178 L 138 147 Q 148 137 158 147 L 158 178" fill="#000000" />

          <path d="M 174 176 L 174 139 Q 194 129 214 139 L 214 176" fill="#F9BC15" />
          <path d="M 183 176 L 183 144 Q 194 134 205 144 L 205 176" fill="#000000" />

          <path d="M 222 176 L 222 138 Q 244 128 266 138 L 266 176" fill="#F9BC15" />
          <path d="M 232 176 L 232 143 Q 244 133 256 143 L 256 176" fill="#000000" />

          <path d="M 274 177 L 274 139 Q 294 129 314 139 L 314 177" fill="#F9BC15" />
          <path d="M 283 177 L 283 144 Q 294 134 305 144 L 305 177" fill="#000000" />

          <path d="M 322 180 L 322 144 Q 338 135 354 144 L 354 180" fill="#F9BC15" />
          <path d="M 329 180 L 329 149 Q 338 140 347 149 L 347 180" fill="#000000" />

          <path d="M 362 184 L 362 150 Q 376 141 390 150 L 390 184" fill="#F9BC15" />
          <path d="M 368 184 L 368 155 Q 376 146 384 155 L 384 184" fill="#000000" />

          {/* Middle Cornice Band 2 */}
          <path d="M 12 270 C 120 264, 250 262, 488 285" />
          <path d="M 12 278 C 120 272, 250 270, 488 293" />

          {/* SECOND TIER ARCHES */}
          <path d="M 20 270 L 20 220 Q 35 206 50 220 L 50 270" fill="#F9BC15" />
          <path d="M 26 270 L 26 226 Q 35 214 44 226 L 44 270" fill="#000000" />

          <path d="M 58 266 L 58 214 Q 75 200 92 214 L 92 266" fill="#F9BC15" />
          <path d="M 65 266 L 65 220 Q 75 208 85 220 L 85 266" fill="#000000" />

          <path d="M 100 264 L 100 208 Q 120 194 140 208 L 140 264" fill="#F9BC15" />
          <path d="M 108 264 L 108 214 Q 120 202 132 214 L 132 264" fill="#000000" />

          <path d="M 148 263 L 148 204 Q 170 190 192 204 L 192 263" fill="#F9BC15" />
          <path d="M 157 263 L 157 210 Q 170 198 183 210 L 183 263" fill="#000000" />

          <path d="M 200 262 L 200 202 Q 224 188 248 202 L 248 262" fill="#F9BC15" />
          <path d="M 210 262 L 210 208 Q 224 196 238 208 L 238 262" fill="#000000" />

          <path d="M 256 262 L 256 202 Q 280 188 304 202 L 304 262" fill="#F9BC15" />
          <path d="M 266 262 L 266 208 Q 280 196 294 208 L 294 262" fill="#000000" />

          <path d="M 312 263 L 312 204 Q 330 192 348 204 L 348 263" fill="#F9BC15" />
          <path d="M 320 263 L 320 210 Q 330 200 340 210 L 340 263" fill="#000000" />

          {/* Lower Cornice Band 3 */}
          <path d="M 12 345 C 130 342, 250 342, 488 358" />
          <path d="M 12 352 C 130 349, 250 349, 488 365" />

          {/* THIRD / GROUND TIER ARCHES */}
          <path d="M 18 345 L 18 295 Q 32 284 46 295 L 46 345" fill="#F9BC15" />
          <path d="M 24 345 L 24 300 Q 32 290 40 300 L 40 345" fill="#000000" />

          <path d="M 54 343 L 54 292 Q 72 280 90 292 L 90 343" fill="#F9BC15" />
          <path d="M 62 343 L 62 297 Q 72 286 82 297 L 82 343" fill="#000000" />

          <path d="M 98 342 L 98 290 Q 118 278 138 290 L 138 342" fill="#F9BC15" />
          <path d="M 106 342 L 106 295 Q 118 284 130 295 L 130 342" fill="#000000" />

          <path d="M 146 342 L 146 288 Q 168 276 190 288 L 190 342" fill="#F9BC15" />
          <path d="M 155 342 L 155 293 Q 168 282 181 293 L 181 342" fill="#000000" />

          <path d="M 198 342 L 198 288 Q 220 276 242 288 L 242 342" fill="#F9BC15" />
          <path d="M 207 342 L 207 293 Q 220 282 233 293 L 233 342" fill="#000000" />

          <path d="M 412 352 L 412 305 Q 430 295 448 305 L 448 352" fill="#F9BC15" />
          <path d="M 420 352 L 420 310 Q 430 301 440 310 L 440 352" fill="#000000" />

          <path d="M 456 354 L 456 308 Q 470 298 484 308 L 484 354" fill="#F9BC15" />
          <path d="M 462 354 L 462 313 Q 470 304 478 313 L 478 354" fill="#000000" />
        </g>

        {/* ================= PARKING "P" CIRCLE SIGN ================= */}
        <g transform="translate(405, 172)">
          {/* Outer thick black border disk */}
          <circle cx="0" cy="0" r="82" fill="#000000" />

          {/* Inner concentric yellow border */}
          <circle
            cx="0"
            cy="0"
            r="74"
            fill="none"
            stroke="#F9BC15"
            strokeWidth="7.5"
          />

          {/* Inner solid black disk */}
          <circle cx="0" cy="0" r="68" fill="#000000" />

          {/* Giant Yellow Bold "P" */}
          <text
            x="0"
            y="38"
            textAnchor="middle"
            fill="#F9BC15"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Impact', 'Montserrat', 'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="118"
          >
            P
          </text>
        </g>

        {/* ================= GROUND BASELINE ================= */}
        <line
          x1="8"
          y1="362"
          x2="492"
          y2="362"
          stroke="#000000"
          strokeWidth="3.5"
        />
        <line
          x1="8"
          y1="468"
          x2="492"
          y2="468"
          stroke="#000000"
          strokeWidth="4.5"
        />

        {/* ================= FIAT 500 (VINTAGE CINQUECENTO) ================= */}
        <g id="fiat-500" transform="translate(0, 10)">
          {/* Shadow under car */}
          <ellipse
            cx="255"
            cy="460"
            rx="205"
            ry="12"
            fill="#000000"
            opacity="0.3"
          />

          {/* MAIN BODY SILHOUETTE */}
          <path
            d="
              M 85 432
              C 85 415, 82 405, 80 395
              C 76 385, 78 375, 88 370
              C 94 366, 102 365, 115 365
              C 125 360, 135 348, 150 330
              C 170 306, 195 292, 230 286
              C 255 282, 305 282, 335 292
              C 350 297, 365 315, 375 338
              C 382 355, 395 368, 412 374
              C 432 380, 442 388, 446 405
              C 448 415, 448 425, 444 434
              L 444 438
              C 442 443, 436 445, 428 445
              L 424 445
              C 424 410, 396 385, 362 385
              C 328 385, 300 410, 300 445
              L 205 445
              C 205 410, 177 385, 143 385
              C 109 385, 81 410, 81 445
              L 68 445
              C 60 445, 56 440, 58 432
              Z
            "
            fill="#F9BC15"
            stroke="#000000"
            strokeWidth="5.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Rear Bumper */}
          <path
            d="M 52 422 C 48 422, 45 426, 46 432 C 47 438, 52 442, 64 442 L 72 442 C 70 435, 70 428, 72 422 Z"
            fill="#F9BC15"
            stroke="#000000"
            strokeWidth="4.5"
          />

          {/* Front Bumper with Overriders */}
          <path
            d="M 440 425 C 452 426, 462 430, 462 437 C 462 444, 452 448, 438 448 L 434 448 C 435 440, 436 432, 434 425 Z"
            fill="#F9BC15"
            stroke="#000000"
            strokeWidth="4.5"
          />

          {/* Front Headlight */}
          <ellipse
            cx="436"
            cy="398"
            rx="6"
            ry="10"
            fill="#F9BC15"
            stroke="#000000"
            strokeWidth="4.5"
          />
          <ellipse cx="436" cy="398" rx="3" ry="6" fill="#000000" />

          {/* Front Turn Signal Indicator */}
          <ellipse
            cx="426"
            cy="418"
            rx="4"
            ry="4"
            fill="#F9BC15"
            stroke="#000000"
            strokeWidth="3.5"
          />

          {/* Front Hood Seam */}
          <path
            d="M 408 375 C 388 380, 368 382, 355 383"
            fill="none"
            stroke="#000000"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Fabric Sunroof Detail */}
          <path
            d="M 215 288 C 220 282, 275 280, 308 286"
            fill="none"
            stroke="#000000"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M 212 294 C 220 288, 275 286, 312 292"
            fill="none"
            stroke="#000000"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Side Windows Outline Frame */}
          <path
            d="
              M 152 334 
              C 168 314, 192 300, 222 296
              C 255 292, 300 294, 326 302
              C 338 306, 350 318, 358 335
              C 362 344, 364 354, 364 360
              L 142 360
              C 142 352, 146 342, 152 334
              Z
            "
            fill="#F9BC15"
            stroke="#000000"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Window Divider Pillar (B-pillar) */}
          <line
            x1="225"
            y1="296"
            x2="225"
            y2="360"
            stroke="#000000"
            strokeWidth="4.5"
          />

          {/* Steering Wheel inside window */}
          <path
            d="M 318 354 L 305 334 Q 300 326 308 322"
            fill="none"
            stroke="#000000"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <ellipse
            cx="304"
            cy="326"
            rx="4"
            ry="7"
            fill="none"
            stroke="#000000"
            strokeWidth="3"
            transform="rotate(-20 304 326)"
          />

          {/* Door Cutout Line & Seams */}
          <path
            d="
              M 358 360
              L 348 382
              C 345 390, 344 415, 345 444
              M 225 360
              L 223 395
              C 222 415, 222 435, 223 445
            "
            fill="none"
            stroke="#000000"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Door Handle */}
          <rect x="232" y="372" width="22" height="7" rx="3.5" fill="#000000" />
          <circle cx="258" cy="375.5" r="2.5" fill="#000000" />

          {/* Rocker Panel Accent Lines */}
          <path
            d="M 82 418 C 110 416, 130 416, 145 418"
            fill="none"
            stroke="#000000"
            strokeWidth="3"
          />
          <path
            d="M 215 418 C 245 418, 275 418, 305 418"
            fill="none"
            stroke="#000000"
            strokeWidth="3"
          />
          <path
            d="M 365 418 C 390 418, 415 416, 435 416"
            fill="none"
            stroke="#000000"
            strokeWidth="3"
          />

          {/* ================= WHEEL 1: REAR WHEEL (LEFT) ================= */}
          <g transform="translate(142, 445)">
            <circle cx="0" cy="0" r="38" fill="#000000" />
            <circle
              cx="0"
              cy="0"
              r="27"
              fill="#F9BC15"
              stroke="#000000"
              strokeWidth="4"
            />
            <circle cx="0" cy="0" r="16" fill="#000000" />
            <circle
              cx="0"
              cy="0"
              r="9"
              fill="#F9BC15"
              stroke="#000000"
              strokeWidth="3"
            />
          </g>

          {/* ================= WHEEL 2: FRONT WHEEL (RIGHT) ================= */}
          <g transform="translate(362, 445)">
            <circle cx="0" cy="0" r="38" fill="#000000" />
            <circle
              cx="0"
              cy="0"
              r="27"
              fill="#F9BC15"
              stroke="#000000"
              strokeWidth="4"
            />
            <circle cx="0" cy="0" r="16" fill="#000000" />
            <circle
              cx="0"
              cy="0"
              r="9"
              fill="#F9BC15"
              stroke="#000000"
              strokeWidth="3"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
