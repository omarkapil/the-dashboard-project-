from gvm.connections import UnixSocketConnection, TLSConnection
from gvm.protocols.gmp import Gmp
from gvm.xml import pretty_print
import ssl
import os

class GVMConnector:
    """
    Class to manage connection to GVM (OpenVAS) via GMP protocol.
    """
    def __init__(self, username, password, hostname='127.0.0.1', port=9390):
        self.hostname = hostname
        self.port = port
        self.username = username
        self.password = password
        self.gmp = None

    def connect_and_login(self):
        """Opens a secure TLS connection and logs in."""
        # Setup SSL/TLS context
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        context.check_hostname = False # Disable hostname check for testing
        context.verify_mode = ssl.CERT_NONE  # Disable certificate verification for testing (should be adjusted in production)
        
        # Create connection
        connection = TLSConnection(hostname=self.hostname, port=self.port, ssl_context=context)
        
        # Open connection and authenticate
        self.gmp = connection.open()
        self.gmp.authenticate(self.username, self.password)
        print(f"✅ Logged in to GVM at {self.hostname}")

    def get_version(self):
        """Test: Fetch GMP protocol version."""
        if not self.gmp:
            self.connect_and_login()
        return self.gmp.get_version()

    def close(self):
        """Close the connection."""
        if self.gmp:
            self.gmp.stop()

# Example usage in the same file to verify connection (can be removed later)
if __name__ == '__main__':
    # Ensure these variables are set in the environment or .env file
    GVM_USER = os.environ.get('GVM_USER', 'admin') # Change default value
    GVM_PASS = os.environ.get('GVM_PASS', 'your_secure_password') # Change default value
    
    try:
        connector = GVMConnector(GVM_USER, GVM_PASS, hostname='127.0.0.1', port=9390)
        connector.connect_and_login()
        
        version = connector.get_version()
        print(f"GVM GMP Version: {version}")
        
    except Exception as e:
        print(f"❌ Connection or Authentication Failed: {e}")
    finally:
        if 'connector' in locals():
            connector.close()
