frappe.ready(function () {

    $('.submit-btn').off("click").on("click", function () {

        var organization_name = frappe.web_form.get_value('organization_name');
        var organization_type = frappe.web_form.get_value('organization_type');
        var tender_service_type = frappe.web_form.get_value('tender_service_type');
        var country = frappe.web_form.get_value('country');
        var organization_address = frappe.web_form.get_value('organization_address');
        var establish_date = frappe.web_form.get_value('establish_date');
        var organization_phone = frappe.web_form.get_value('organization_phone');
        var organization_type = frappe.web_form.get_value('organization_type');
        var organization_name = frappe.web_form.get_value('organization_name');
        var organization_type = frappe.web_form.get_value('organization_type');

        frappe.call({
            type: "POST",
            method: 'aogc_customization.aogc.web_form.register_organization.register_organization.create_user_and_supplier',
            args: {

            },
            callback: function (response) {
                console.log(response);
            }
        });
    });
    // frappe.ui.form.on('Register Organization', {
    //     validate: function(frm) {
    //         alert("working")
    //         // Generate a new password
    //         var new_password = generateRandomPassword();

    //         // Set the password for the user associated with the organization
    //         frappe.call({
    //             method: 'aogc_customization.aogc_customization.aogc.web_form.register_organization.register_organization.py',
    //             args: {
    //                 'user_email': frm.doc.email_address,
    //                 'new_password': new_password
    //             },
    //             callback: function(response) {
    //                 frappe.msgprint('Password set successfully!');
    //             }
    //         });
    //     }
    // });


    function generateRandomPassword() {
        // Implement your own password generation logic here
        // Example implementation generating a random alphanumeric password
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var password = '';
        for (var i = 0; i < 10; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
    }


})