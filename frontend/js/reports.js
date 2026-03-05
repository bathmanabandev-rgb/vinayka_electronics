// Reports Module
class Reports {
  // Initialize
  static init() {
    this.loadReports();
  }

  // Load reports
  static async loadReports() {
    try {
      const [dailySalesResponse, monthlySalesResponse] = await Promise.all([
        API.getDailySales(),
        API.getMonthlySales()
      ]);

      if (dailySalesResponse.success) {
        this.displayDailySales(dailySalesResponse.data);
      }

      if (monthlySalesResponse.success) {
        this.displayMonthlySales(monthlySalesResponse.data);
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }

  // Display daily sales
  static displayDailySales(data) {
    const tbody = document.getElementById('dailySalesBody');

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">No data available</td></tr>';
      return;
    }

    let html = '';
    data.forEach(row => {
      html += `
        <tr>
          <td>${Utils.formatDateOnly(row.date)}</td>
          <td>${Utils.formatCurrency(row.sales)}</td>
          <td>${row.bills}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  // Display monthly sales
  static displayMonthlySales(data) {
    const tbody = document.getElementById('monthlySalesBody');

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">No data available</td></tr>';
      return;
    }

    let html = '';
    data.forEach(row => {
      html += `
        <tr>
          <td>${row.month}</td>
          <td>${Utils.formatCurrency(row.sales)}</td>
          <td>${row.bills}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }
}

// Initialize
reports = Reports;
