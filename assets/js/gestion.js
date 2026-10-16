(() => {
  'use strict';

  const dashboard = document.getElementById('dashboard-demo');
  if (!dashboard) return;

  // Datos ficticios y locales. No se consultan ni se guardan datos de clientes.
  const businesses = {
    comercio: {
      name: 'Comercio', revenueLabel: 'Ventas del período', volumeLabel: 'Ventas realizadas',
      averageLabel: 'Ticket promedio', chartTitle: 'Evolución de ventas',
      rankingTitle: 'Tus líneas con más ventas', itemLabel: 'Línea',
      items: ['Hogar', 'Accesorios', 'Regalería'], shares: [42, 33, 25], margin: 42,
      insightTitle: 'Tu producto más vendido puede abrir otra venta.',
      insight: 'La línea Hogar concentra el 42 % de tus ingresos de ejemplo. Probá una propuesta con productos complementarios y medí el resultado.',
      periods: {
        semana: { revenue: [58000, 82000, 64000, 106000, 91000, 124000, 87000], volume: 52, pending: 73440 },
        mes: { revenue: [440000, 510000, 562000, 640000], volume: 184, pending: 258240 },
        trimestre: { revenue: [1760000, 1940000, 2152000], volume: 508, pending: 702240 },
      },
    },
    servicios: {
      name: 'Servicios', revenueLabel: 'Ingresos del período', volumeLabel: 'Trabajos realizados',
      averageLabel: 'Ingreso por trabajo', chartTitle: 'Evolución de ingresos',
      rankingTitle: 'Los servicios que más aportan', itemLabel: 'Servicio',
      items: ['Asesoramiento', 'Mantenimiento', 'Proyectos'], shares: [48, 32, 20], margin: 64,
      insightTitle: 'Un buen servicio puede convertirse en una relación continua.',
      insight: 'El asesoramiento aporta el 48 % de los ingresos de ejemplo. Evaluá un plan de seguimiento para acompañar a esos clientes de forma periódica.',
      periods: {
        semana: { revenue: [45000, 78000, 52000, 95000, 110000, 60000, 0], volume: 16, pending: 88000 },
        mes: { revenue: [320000, 405000, 450000, 485000], volume: 58, pending: 332000 },
        trimestre: { revenue: [1320000, 1490000, 1660000], volume: 162, pending: 894000 },
      },
    },
    emprendimiento: {
      name: 'Emprendimiento', revenueLabel: 'Ventas del período', volumeLabel: 'Pedidos realizados',
      averageLabel: 'Valor por pedido', chartTitle: 'Evolución de ventas',
      rankingTitle: 'Qué eligen tus clientes', itemLabel: 'Producto',
      items: ['Kits de regalo', 'Personalizados', 'Línea esencial'], shares: [45, 35, 20], margin: 51,
      insightTitle: 'Tu próxima campaña puede empezar por lo que ya funciona.',
      insight: 'Los kits de regalo representan el 45 % de las ventas de ejemplo. Probá una preventa para planificar insumos y medir la demanda antes de producir.',
      periods: {
        semana: { revenue: [22000, 34000, 18000, 48000, 56000, 72000, 38000], volume: 32, pending: 43200 },
        mes: { revenue: [192000, 246000, 278000, 324000], volume: 118, pending: 156000 },
        trimestre: { revenue: [740000, 890000, 1040000], volume: 309, pending: 400500 },
      },
    },
  };

  const periods = {
    semana: { name: 'Semana de ejemplo', total: 'Total de la semana', labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] },
    mes: { name: 'Mes de ejemplo', total: 'Total del mes', labels: ['Sem. 1', 'Sem. 2', 'Sem. 3', 'Sem. 4'] },
    trimestre: { name: 'Trimestre de ejemplo', total: 'Total del trimestre', labels: ['Mes 1', 'Mes 2', 'Mes 3'] },
  };
  const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  const integer = new Intl.NumberFormat('es-AR');
  const money = (value) => currency.format(value);
  const compactMoney = (value) => value >= 1000000
    ? `$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(value / 1000000)} M`
    : `$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(value / 1000)} mil`;
  const setText = (id, text) => { document.getElementById(id).textContent = text; };
  const periodSelect = document.getElementById('dashboard-period');
  const buttons = [...dashboard.querySelectorAll('[data-business]')];
  let selectedBusiness = 'comercio';

  const render = (announce = true) => {
    const business = businesses[selectedBusiness];
    const period = periods[periodSelect.value];
    const data = business.periods[periodSelect.value];
    const revenue = data.revenue.reduce((sum, value) => sum + value, 0);
    const grossMargin = Math.round(revenue * business.margin / 100);

    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.business === selectedBusiness)));
    setText('dashboard-business', `${business.name.toLocaleUpperCase('es-AR')} · PANEL DE GESTIÓN`);
    setText('metric-revenue-label', business.revenueLabel);
    setText('metric-revenue', money(revenue));
    setText('metric-revenue-note', period.name);
    setText('metric-margin', `${business.margin} %`);
    setText('metric-margin-note', `${money(grossMargin)} antes de otros gastos`);
    setText('metric-volume-label', business.volumeLabel);
    setText('metric-volume', integer.format(data.volume));
    setText('metric-volume-note', `${business.averageLabel}: ${money(revenue / data.volume)}`);
    setText('metric-pending', money(data.pending));
    setText('chart-title', business.chartTitle);
    setText('chart-total', period.total);
    setText('insight-title', business.insightTitle);
    setText('insight-copy', business.insight);
    setText('ranking-title', business.rankingTitle);
    setText('ranking-item-label', business.itemLabel);
    setText('ranking-caption', `Ingresos ficticios por ${business.itemLabel.toLocaleLowerCase('es-AR')} · ${period.name}`);

    const chart = document.getElementById('revenue-chart');
    const max = Math.max(...data.revenue, 1);
    chart.replaceChildren(...data.revenue.map((value, index) => {
      const column = document.createElement('div');
      column.className = 'chart-column';
      const amount = document.createElement('span');
      amount.className = 'chart-value';
      amount.textContent = compactMoney(value);
      const bar = document.createElement('span');
      bar.className = `chart-bar${value === max ? ' chart-bar-highlight' : ''}`;
      bar.style.setProperty('--bar-height', `${value / max * 100}%`);
      const label = document.createElement('span');
      label.className = 'chart-label';
      label.textContent = period.labels[index];
      column.append(amount, bar, label);
      return column;
    }));
    chart.classList.toggle('chart-week', periodSelect.value === 'semana');
    chart.setAttribute('aria-label', `${business.chartTitle}. ${period.name}. ${data.revenue.map((value, index) => `${period.labels[index]}: ${money(value)}`).join('; ')}. Total: ${money(revenue)}.`);

    let distributed = 0;
    document.getElementById('ranking-body').replaceChildren(...business.items.map((name, index) => {
      const amount = index === business.items.length - 1 ? revenue - distributed : Math.round(revenue * business.shares[index] / 100);
      distributed += amount;
      const row = document.createElement('tr');
      const title = document.createElement('th');
      title.scope = 'row';
      title.textContent = name;
      const value = document.createElement('td');
      value.textContent = money(amount);
      const share = document.createElement('td');
      share.textContent = `${business.shares[index]} %`;
      row.append(title, value, share);
      return row;
    }));

    let allocated = 0;
    document.getElementById('collections-list').replaceChildren(...[50, 30, 20].map((share, index) => {
      const amount = index === 2 ? data.pending - allocated : Math.round(data.pending * share / 100);
      allocated += amount;
      const item = document.createElement('li');
      const description = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = `Cliente ${String.fromCharCode(65 + index)}`;
      const subtitle = document.createElement('small');
      subtitle.textContent = 'Saldo pendiente';
      description.append(title, subtitle);
      const value = document.createElement('b');
      value.textContent = money(amount);
      item.append(description, value);
      return item;
    }));

    if (announce) setText('dashboard-status', `${business.name}. ${period.name}. ${business.revenueLabel}: ${money(revenue)}. Margen bruto estimado: ${business.margin} por ciento. Saldo por cobrar: ${money(data.pending)}.`);
  };

  buttons.forEach((button) => button.addEventListener('click', () => {
    if (!Object.hasOwn(businesses, button.dataset.business)) return;
    selectedBusiness = button.dataset.business;
    render();
  }));
  periodSelect.addEventListener('change', () => {
    if (Object.hasOwn(periods, periodSelect.value)) render();
  });
  render(false);
})();
