from weasyprint import HTML
from sqlalchemy.orm import Session
from app.models.sale import Sale
from app.models.product import Product

def generate_receipt_html(sale: Sale, db: Session) -> str:
    rows = []
    for item in sale.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        product_name = product.name if product else f"Product #{item.product_id}"
        rows.append(
            f"<tr><td>{item.quantity}x</td><td>{product_name}</td>"
            f"<td>KES {item.unit_price}</td><td>KES {item.line_total}</td></tr>"
        )
    items_rows = "".join(rows)

    return f"""
    <html>
    <head><style>
        body {{ font-family: monospace; font-size: 12px; width: 280px; }}
        h2 {{ text-align: center; margin-bottom: 4px; }}
        p {{ text-align: center; margin: 2px 0; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
        td {{ padding: 2px 0; }}
        .total {{ font-weight: bold; border-top: 1px dashed #000; margin-top: 8px; padding-top: 8px; }}
    </style></head>
    <body>
        <h2>BLUESWITCH DYNAMIC LTD</h2>
        <p>Sale #{sale.id}</p>
        <p>{sale.created_at.strftime('%Y-%m-%d %H:%M')}</p>
        <p>Cashier: {sale.cashier_name or '-'}</p>
        <hr>
        <table>{items_rows}</table>
        <div class="total">
            <p>TOTAL: KES {sale.total_amount}</p>
            <p>PAID: KES {sale.amount_paid}</p>
        </div>
        <p style="margin-top:6px;">*** NOT A KRA FISCAL RECEIPT ***</p>
        <p>Thank you for your business!</p>
    </body>
    </html>
    """

def generate_receipt_pdf(sale: Sale, db: Session) -> bytes:
    html_content = generate_receipt_html(sale, db)
    return HTML(string=html_content).write_pdf()
