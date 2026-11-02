const ADMIN_ROLE = 'ADMIN';
const USER_ROLE = 'USER';
const CSV_REPORT = 'CSV';
const HTML_REPORT = 'HTML';
const ADMIN_PRIORITY_LIMIT = 1000;
const STANDARD_USER_VALUE_LIMIT = 500;

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const visibleItems = this.getVisibleItems(user, items);
    const total = this.calculateTotal(visibleItems);
    const rows = visibleItems
      .map(item => this.generateItemRow(reportType, item, user))
      .join('');

    return [
      this.generateHeader(reportType, user),
      rows,
      this.generateFooter(reportType, total),
    ].join('').trim();
  }

  getVisibleItems(user, items) {
    if (user.role === ADMIN_ROLE) {
      return items.map(item => this.prepareAdminItem(item));
    }

    if (user.role === USER_ROLE) {
      return items.filter(item => item.value <= STANDARD_USER_VALUE_LIMIT);
    }

    return [];
  }

  prepareAdminItem(item) {
    return {
      ...item,
      priority: item.value > ADMIN_PRIORITY_LIMIT,
    };
  }

  calculateTotal(items) {
    return items.reduce((total, item) => total + item.value, 0);
  }

  generateHeader(reportType, user) {
    if (reportType === CSV_REPORT) {
      return 'ID,NOME,VALOR,USUARIO\n';
    }

    if (reportType === HTML_REPORT) {
      return [
        '<html><body>\n',
        '<h1>Relatório</h1>\n',
        `<h2>Usuário: ${user.name}</h2>\n`,
        '<table>\n',
        '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n',
      ].join('');
    }

    return '';
  }

  generateItemRow(reportType, item, user) {
    if (reportType === CSV_REPORT) {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }

    if (reportType === HTML_REPORT) {
      const style = item.priority ? ' style="font-weight:bold;"' : '';
      return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }

    return '';
  }

  generateFooter(reportType, total) {
    if (reportType === CSV_REPORT) {
      return `\nTotal,,\n${total},,\n`;
    }

    if (reportType === HTML_REPORT) {
      return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
    }

    return '';
  }
}
