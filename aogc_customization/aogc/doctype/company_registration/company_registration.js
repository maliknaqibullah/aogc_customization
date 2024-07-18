// Copyright (c) 2024, AOGC and contributors
// For license information, please see license.txt


frappe.ui.form.on("Company Registration", {

    refresh(frm) {
        frm.trigger('addActionButtons')
        frm.toggle_enable([
            "organization_profile_section",
            "organization_name",
            "tender_service_type",
            "organization_address",
            "organization_phone",
            "owner_name",
            "owner_phone",
            "column_break_avig",
            "organization_type",
            "country",
            "establish_date",
            "logo",
            "deputy_name",
            "deputy_phone",
            "license_details_section",
            "license_number",
            "license_issue_date",
            "tin_number",
            "tax_clearance_date",
            "column_break_rqrb",
            "license_document",
            "license_expiry_date",
            "tin_document",
            "complete_registration_section",
            "official_email"
        ], (frm.is_new() ? true : false) || frm.doc.workflow_state == "Rejected");
        if (frm.doc.workflow_state == "Rejected") {

            $('div[data-fieldname="rejection_section"]').css({
                "border": "1px solid red",
                "border-radius": "10px"
            });
            $('div[data-fieldname="rejection_section"]').find('*').css("color", "red");

        }

        if (frm.doc.workflow_state != "Draft") {
            $('.actions-btn-group').hide();

        }
    },
    addActionButtons: function (frm) {
        if (frappe.user_roles.includes("System Manager") && frm.doc.workflow_state === "Pending" && !frm.doc.__unsaved) {

            frm.add_custom_button(__('Reject Organization'), function () {

                // Dialogue 
                let d = new frappe.ui.Dialog({
                    title: 'Rejection Note',
                    fields: [{
                        label: 'Reason for Rejection',
                        fieldname: 'reason_for_rejection',
                        fieldtype: "Link",
                        options: "Rejection Comment",
                        "reqd": 1,
                    },
                    {
                        label: 'Additional Notes',
                        fieldname: 'additional_notes',
                        fieldtype: 'Small Text'
                    },

                    ],
                    primary_action_label: 'Reject',
                    primary_action(values) {
                        console.log(values);
                        if (frm.doc.workflow_state == "Pending") {
                            frappe.confirm(__('Are you sure you want to Reject?'),
                                () => {
                                    frappe.call({
                                        method: "aogc_customization.aogc.doctype.company_registration.company_registration.fetch_comment",
                                        args: {
                                            code: values.reason_for_rejection
                                        },
                                        callback: function (response) {

                                            let comments = `<span style="direction:rtl; ">${response.message.dari_comment} <br> ${response.message.pashto_comment} </span> <br> ${response.message.english_comment}`;
                                            // // action to perform if Yes is selected
                                            // // Set the values for rejection tab
                                            frm.set_value("rejection_reason", comments)
                                            frm.refresh_field("rejection_reason");
                                            frm.set_value("additional_rejection_notes", values.additional_notes)
                                            frm.refresh_field("additional_rejection_notes");

                                            frm.set_value("workflow_state", "Rejected")
                                            frm.refresh_field("workflow_state");
                                            frm.save()
                                            sendRejectionEmail(frm.doc.name, comments, values.additional_notes);
                                        }
                                    })
                                }, () => {
                                    // action to perform if No is selected
                                })

                        }
                        d.hide();
                    }
                });

                d.show();
            },).removeClass('btn-default').addClass("btn btn-danger");
            frm.add_custom_button(__('Approve Organization'), function () {
                // Dialogue 
                frappe.confirm('Are you sure you want to Approve?',
                    () => {
                        // action to perform if Yes is selected
                        if (frm.doc.workflow_state == "Pending") {
                            // Set the values for rejection tab
                            frappe.msgprint({
                                title: __(`Processing...<div class="spinner-grow spinner-grow-sm" role="status">
								<span class="sr-only">Loading...</span>
							  </div>`),
                                message: `Please wait while we process your request...`,
                                clear: true
                            });
                            frappe.call({
                                method: "aogc_customization.aogc.doctype.company_registration.company_registration.approve_organization",
                                args: {
                                    data: frm.doc
                                },
                                callback: function (response) {
                                    // let res = JSON.parse(response);
                                    if (response.message == 'success') {
                                        frappe.hide_msgprint();

                                        frm.set_value("workflow_state", "Approved")
                                        frm.refresh_field("workflow_state");
                                        frm.save("Submit")
                                        frm.refresh()
                                    }
                                }
                            });

                        }
                    }, () => {
                        // action to perform if No is selected
                    })
            },).removeClass('btn-default').addClass("btn btn-primary");
        }

    },
});


function sendRejectionEmail(companyRegistrationName, rejectionReason, additionalNotes) {
    frappe.call({
        method: "aogc_customization.aogc.doctype.company_registration.company_registration.send_rejection_email",
        args: {
            company_registration_name: companyRegistrationName,
            rejection_reason: rejectionReason,
            additional_notes: additionalNotes
        },
        callback: function (response) {
            console.log(response);
            if (response.message) {
                frappe.msgprint(__("Rejection email sent successfully."));
            } else {
                frappe.msgprint(__("Failed to send rejection email."));
            }
        }
    });
}