import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import * as L from 'leaflet';

type Stage = 'home' | 'dealer' | 'issue' | 'schedule' | 'tracking' | 'quote' | 'repair' | 'complete';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  stage: Stage = 'home';
  selectedTab = 'Home';
  dealerSelected = false;
  issue = 'The front-right tyre has a puncture. I am parked safely along Waiyaki Way and cannot continue driving. I need the car collected and taken to the selected garage for inspection and repair.';
  problemType = 'Tyre puncture';
  pickupDate = '2026-10-28';
  pickupTime = 'As soon as possible';
  notes = '';
  bookingConfirmed = false;
  quoteApproved = false;
  toast = '';
  statusIndex = 0;
  routeProgress = 0;
  private map?: L.Map;
  private markers: L.Marker[] = [];
  private routeLine?: L.Polyline;
  private timer?: ReturnType<typeof setInterval>;
  private toastTimer?: ReturnType<typeof setTimeout>;
  private mapStage?: Stage;

  readonly customer = { name: 'James Mwangi', vehicle: '2015 Toyota Fielder', registration: 'KDA 245X' };
  readonly dealer = {
    name: 'Westlands Auto Care', address: 'Westlands, Nairobi', rating: '4.8',
    distance: '2.4 km', response: '12 min', phone: '+254 700 123 456'
  };
  readonly providers = [
    { name: 'Westlands Auto Care', kind: 'Garage · Tyre repair', rating: '4.8', distance: '2.4 km', response: '12 min', lat: -1.2675, lng: 36.8032 },
    { name: 'RoadReady Recovery', kind: 'Vehicle recovery', rating: '4.7', distance: '3.1 km', response: '16 min', lat: -1.2614, lng: 36.8150 },
    { name: 'ABC Motor Garage', kind: 'General repairs', rating: '4.6', distance: '4.8 km', response: '20 min', lat: -1.2780, lng: 36.7905 }
  ];
  readonly statuses = [
    'Request submitted', 'Recovery driver assigned', 'Driver heading to you',
    'Vehicle collected', 'En route to garage', 'Arrived at garage',
    'Inspection completed', 'Quotation ready', 'Repair approved',
    'Repair in progress', 'Quality inspection', 'Vehicle ready'
  ];
  readonly repairTasks = [
    { label: 'Vehicle inspection completed', done: true },
    { label: 'Puncture located', done: true },
    { label: 'Tyre repaired', done: false },
    { label: 'Tyre pressure checked', done: false },
    { label: 'Final quality inspection', done: false }
  ];
  get currentStatus(): string { return this.statuses[Math.min(this.statusIndex, this.statuses.length - 1)]; }
  get trackingDescription(): string {
    if (this.statusIndex < 2) return 'Your recovery request is being prepared.';
    if (this.statusIndex === 2) return 'Your driver is on the way to your location.';
    if (this.statusIndex < 5) return 'Your car is being transported to the selected garage.';
    if (this.statusIndex < 8) return 'The garage is inspecting your vehicle.';
    if (this.statusIndex < 11) return 'The mechanic is completing the approved repair.';
    return 'Your car is ready for collection.';
  }
  get remainingDistance(): string {
    if (this.routeProgress < 0.5) return `${(2.1 * (1 - this.routeProgress)).toFixed(1)} km`;
    return `${(1.7 * (1 - this.routeProgress)).toFixed(1)} km`;
  }
  get estimatedArrival(): string { return this.routeProgress > 0.94 ? 'Arrived' : `${Math.max(1, Math.ceil((1 - this.routeProgress) * 8))} min`; }
  get totalEstimate(): number { return 500 + 2000 + 800; }

  ngAfterViewInit(): void { this.restore(); }
  ngOnDestroy(): void { this.stopSimulation(); if (this.toastTimer) clearTimeout(this.toastTimer); }

  go(stage: Stage): void {
    this.stage = stage;
    this.selectedTab = stage === 'home' ? 'Home' : stage === 'tracking' ? 'Tracking' : 'Booking';
    setTimeout(() => {
      if (stage === 'dealer' || stage === 'tracking') this.renderMap(stage);
      else this.destroyMap();
    }, 80);
  }
  selectDealer(): void { this.dealerSelected = true; this.showToast('Westlands Auto Care selected'); this.go('issue'); this.persist(); }
  confirmBooking(): void {
    this.bookingConfirmed = true;
    this.statusIndex = 0;
    this.routeProgress = 0;
    this.persist();
    this.showToast('Demo appointment confirmed');
    this.go('tracking');
    this.startSimulation();
  }
  startSimulation(): void {
    this.stopSimulation();
    this.timer = setInterval(() => {
      if (this.statusIndex < 5) {
        this.routeProgress = Math.min(1, this.routeProgress + 0.035);
        if (this.routeProgress > 0.33 && this.statusIndex < 2) this.statusIndex = 2;
        if (this.routeProgress > 0.47 && this.statusIndex < 3) this.statusIndex = 3;
        if (this.routeProgress > 0.98 && this.statusIndex < 5) this.statusIndex = 5;
      }
      this.persist();
      this.updateMapPosition();
    }, 1100);
  }
  stopSimulation(): void { if (this.timer) clearInterval(this.timer); this.timer = undefined; }
  advanceDemo(): void {
    this.statusIndex = Math.min(this.statusIndex + 1, this.statuses.length - 1);
    if (this.statusIndex >= 5) this.routeProgress = 1;
    if (this.statusIndex >= 9) this.quoteApproved = true;
    if (this.statusIndex >= 11) { this.go('complete'); this.stopSimulation(); }
    else if (this.statusIndex >= 7) this.go('quote');
    else if (this.statusIndex >= 8) this.go('repair');
    else this.go('tracking');
    this.persist();
    this.showToast(`Demo advanced: ${this.currentStatus}`);
  }
  approveQuote(): void {
    this.quoteApproved = true;
    this.statusIndex = 8;
    this.persist();
    this.showToast('Repair approved in demo');
    this.go('repair');
  }
  advanceRepair(): void {
    this.statusIndex = Math.min(11, Math.max(9, this.statusIndex + 1));
    if (this.statusIndex >= 11) { this.go('complete'); this.stopSimulation(); }
    else this.go('repair');
    this.persist();
  }
  resetDemo(): void {
    this.stopSimulation();
    this.stage = 'home'; this.selectedTab = 'Home'; this.dealerSelected = false;
    this.bookingConfirmed = false; this.quoteApproved = false; this.statusIndex = 0; this.routeProgress = 0;
    localStorage.removeItem('roadready-demo');
    this.destroyMap();
    this.showToast('Demo reset');
  }
  min(a: number, b: number): number { return Math.min(a, b); }
  windowPrint(): void { window.print(); }
  showToast(message: string): void {
    this.toast = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast = '', 2600);
  }
  private persist(): void {
    localStorage.setItem('roadready-demo', JSON.stringify({
      stage: this.stage, dealerSelected: this.dealerSelected, issue: this.issue,
      problemType: this.problemType, pickupDate: this.pickupDate, pickupTime: this.pickupTime,
      notes: this.notes, bookingConfirmed: this.bookingConfirmed, quoteApproved: this.quoteApproved,
      statusIndex: this.statusIndex, routeProgress: this.routeProgress
    }));
  }
  private restore(): void {
    try {
      const saved = localStorage.getItem('roadready-demo');
      if (!saved) return;
      const s = JSON.parse(saved);
      Object.assign(this, s);
      if (this.bookingConfirmed) this.startSimulation();
    } catch { localStorage.removeItem('roadready-demo'); }
  }
  private destroyMap(): void {
    if (this.map) { this.map.remove(); this.map = undefined; }
    this.markers = []; this.routeLine = undefined; this.mapStage = undefined;
  }
  private renderMap(stage: Stage): void {
    const id = stage === 'dealer' ? 'dealer-map' : 'tracking-map';
    const el = document.getElementById(id);
    if (!el) return;
    if (this.map && this.mapStage === stage) { this.map.invalidateSize(); return; }
    this.destroyMap();
    this.mapStage = stage;
    const pickup: L.LatLngExpression = [-1.2634, 36.8018];
    const garage: L.LatLngExpression = [-1.2675, 36.8032];
    this.map = L.map(id, { zoomControl: false, attributionControl: true }).setView(pickup, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    const pin = (emoji: string, color: string) => L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="width:38px;height:38px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 3px 12px #0003;display:grid;place-items:center;font-size:18px">${emoji}</div>`,
      iconSize: [38, 38], iconAnchor: [19, 19]
    });
    if (stage === 'dealer') {
      this.providers.forEach((p, i) => {
        const m = L.marker([p.lat, p.lng], { icon: pin('🔧', i === 0 ? '#c8f43b' : '#ffffff') }).addTo(this.map!);
        m.bindPopup(`<b>${p.name}</b><br>${p.kind}<br>★ ${p.rating} · ${p.distance}`);
        this.markers.push(m);
      });
      L.marker(pickup, { icon: pin('🚗', '#252623') }).addTo(this.map).bindPopup('Your car · Waiyaki Way');
      this.map.fitBounds(L.latLngBounds(this.providers.map(p => [p.lat, p.lng] as L.LatLngExpression).concat([pickup])), { padding: [28, 28] });
    } else {
      const route: L.LatLngExpression[] = [
        pickup, [-1.2639,36.8021], [-1.2644,36.8025], [-1.2652,36.8028],
        [-1.2660,36.8030], garage
      ];
      this.routeLine = L.polyline(route, { color: '#252623', weight: 5, dashArray: '8 8', opacity: 0.9 }).addTo(this.map);
      L.marker(pickup, { icon: pin('🚗', '#c8f43b') }).addTo(this.map).bindPopup('Pickup · Waiyaki Way');
      L.marker(garage, { icon: pin('🔧', '#ffffff') }).addTo(this.map).bindPopup('Westlands Auto Care');
      const point = this.pointAlong(route, this.routeProgress);
      this.markers.push(L.marker(point, { icon: pin('🚚', '#252623'), zIndexOffset: 1000 }).addTo(this.map).bindPopup('Simulated recovery vehicle'));
      this.map.fitBounds(this.routeLine.getBounds(), { padding: [35, 35] });
    }
    setTimeout(() => this.map?.invalidateSize(), 120);
  }
  private pointAlong(route: L.LatLngExpression[], progress: number): L.LatLng {
    const pts = route.map(p => L.latLng(p));
    const lengths = pts.slice(1).map((p, i) => pts[i].distanceTo(p));
    const total = lengths.reduce((a, b) => a + b, 0);
    let remaining = total * progress;
    for (let i = 0; i < lengths.length; i++) {
      if (remaining <= lengths[i]) return L.latLng(
        pts[i].lat + (pts[i + 1].lat - pts[i].lat) * (remaining / lengths[i]),
        pts[i].lng + (pts[i + 1].lng - pts[i].lng) * (remaining / lengths[i])
      );
      remaining -= lengths[i];
    }
    return pts[pts.length - 1];
  }
  private updateMapPosition(): void {
    if (this.stage !== 'tracking' || !this.map) return;
    const route: L.LatLngExpression[] = [
      [-1.2634,36.8018], [-1.2639,36.8021], [-1.2644,36.8025],
      [-1.2652,36.8028], [-1.2660,36.8030], [-1.2675,36.8032]
    ];
    const p = this.pointAlong(route, this.routeProgress);
    const marker = this.markers[0];
    if (marker) marker.setLatLng(p);
  }
}