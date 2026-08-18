with open('d:/amaze-erp/src/modules/project-manager/pages/PMProjectsPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.splitlines(keepends=True)
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if "order.payment_status?.toLowerCase()" in line:
        start_idx = i - 1
    if "setIsDeptStatusOpen(true)" in line:
        end_idx = i + 2

if start_idx is not None and end_idx is not None:
    print(f"Found block between line {start_idx+1} and {end_idx+1}")
    indent = " " * (len(lines[start_idx]) - len(lines[start_idx].lstrip()))
    new_block = [
        indent + "onClick={() => {\n",
        indent + "  setSelectedOrderId(order.order_id || order.id);\n",
        indent + "  setSelectedProjectId(proj.id);\n",
        indent + '  setSelectedProjectName(proj.project_name || "");\n',
        indent + '  setSelectedOrderNumber(order.order_number || "");\n',
        indent + '  setSelectedPaymentStatus(order.payment_status || "");\n',
        indent + "  setIsDeptStatusOpen(true);\n",
        indent + "}},\n"
    ]
    lines[start_idx:end_idx+1] = new_block
    new_content = "".join(lines)
    with open('d:/amaze-erp/src/modules/project-manager/pages/PMProjectsPage.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced block!")
else:
    print("Warning: could not locate onClick boundaries!")
