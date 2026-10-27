# RoadReady — roadside repair demo

A single-scenario Ionic + Angular presentation prototype. All customer, dealer, booking, pricing, driver and repair information is fictional.

## Requirements
- Node.js 20.19+ recommended
- npm
- Internet access for OpenStreetMap tiles and Google Fonts (the rest of the demo is local)

## Run
```bash
npm install
npm start
```
Open the local URL printed by Angular CLI, normally http://localhost:4200.

## Build
```bash
npm run build
```

## Demo flow
1. Tap **Get roadside assistance**.
2. Select **Westlands Auto Care** on the map.
3. Confirm the sample tyre-puncture description.
4. Choose pickup details and confirm the appointment.
5. Watch the recovery vehicle move on the map automatically.
6. Use **Advance demo scenario** to present the inspection, quotation, approval, repair and completion stages.
7. Use **Reset this demo** or **Reset and replay scenario** to start again.

## Important
- This is a virtual scenario, not a real dispatch or repair service.
- Map tiles come from OpenStreetMap and require internet access. The route and moving recovery vehicle are simulated.
- The demo saves its current scenario in browser LocalStorage.
- No real calls, payments, provider communications or GPS tracking occur.
# roader
