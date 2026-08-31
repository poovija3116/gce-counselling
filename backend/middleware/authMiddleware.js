const jwt = require("jsonwebtoken");


// ============================================================
// AUTHENTICATE JWT TOKEN
// ============================================================

function authenticateToken(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;


        // ----------------------------------------------------
        // CHECK AUTHORIZATION HEADER
        // ----------------------------------------------------

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message:
                    "Authorization token is required"

            });

        }


        // ----------------------------------------------------
        // CHECK BEARER FORMAT
        // ----------------------------------------------------

        if (
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authorization format. Use Bearer token."

            });

        }


        const token =
            authHeader.substring(7).trim();


        if (!token) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication token is missing"

            });

        }


        // ----------------------------------------------------
        // CHECK JWT SECRET
        // ----------------------------------------------------

        if (!process.env.JWT_SECRET) {

            console.error(
                "❌ JWT_SECRET is not configured in .env"
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server authentication configuration error"

            });

        }


        // ----------------------------------------------------
        // VERIFY TOKEN
        // ----------------------------------------------------

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ----------------------------------------------------
        // STORE USER INFORMATION
        // ----------------------------------------------------

        req.user = decoded;


        console.log(
            "✅ AUTHENTICATED USER:",
            {
                id: decoded.id,
                user_id: decoded.user_id,
                email: decoded.email,
                role: decoded.role
            }
        );


        next();

    }

    catch (error) {

        console.error(
            "❌ JWT AUTHENTICATION ERROR:",
            error.message
        );


        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired token"

        });

    }

}



// ============================================================
// ROLE AUTHORIZATION
// ============================================================

function requireRole(...allowedRoles) {

    return (req, res, next) => {


        // ----------------------------------------------------
        // CHECK AUTHENTICATION
        // ----------------------------------------------------

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        // ----------------------------------------------------
        // GET USER ROLE
        // ----------------------------------------------------

        const userRole =
            String(
                req.user.role || ""
            )
            .trim()
            .toLowerCase();


        // ----------------------------------------------------
        // NORMALIZE ALLOWED ROLES
        // ----------------------------------------------------

        const normalizedAllowedRoles =
            allowedRoles.map(
                role =>
                    String(role)
                        .trim()
                        .toLowerCase()
            );


        console.log(
            "🔐 ROLE CHECK:",
            {
                userRole,
                allowedRoles:
                    normalizedAllowedRoles
            }
        );


        // ----------------------------------------------------
        // CHECK ROLE
        // ----------------------------------------------------

        if (
            !normalizedAllowedRoles.includes(
                userRole
            )
        ) {

            console.error(
                "❌ ACCESS DENIED:",
                {
                    userRole,
                    allowedRoles:
                        normalizedAllowedRoles
                }
            );


            return res.status(403).json({

                success: false,

                message:
                    "Access denied",

                user_role:
                    userRole || null,

                required_roles:
                    normalizedAllowedRoles

            });

        }


        // ----------------------------------------------------
        // ROLE ACCEPTED
        // ----------------------------------------------------

        next();

    };

}



// ============================================================
// EXPORT
// ============================================================

module.exports = {

    authenticateToken,

    requireRole

};