import os
from datetime import datetime
import hashlib

# Configuración de Supabase (estas variables deben estar en el entorno)
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-supabase-anon-key"

def create_database_schema():
    """
    Crea el esquema de la base de datos para Jorling Seguidores
    """
    
    # SQL para crear las tablas necesarias
    sql_commands = [
        # Tabla de usuarios
        """
        CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_active BOOLEAN DEFAULT TRUE,
            email_verified BOOLEAN DEFAULT FALSE,
            total_spent DECIMAL(10,2) DEFAULT 0.00,
            total_orders INTEGER DEFAULT 0
        );
        """,
        
        # Tabla de servicios
        """
        CREATE TABLE IF NOT EXISTS services (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            platform VARCHAR(50) NOT NULL, -- facebook, instagram, youtube, twitter
            service_type VARCHAR(50) NOT NULL, -- followers, likes, comments, views, watch_time
            price_per_unit DECIMAL(10,4) NOT NULL,
            min_quantity INTEGER DEFAULT 1,
            max_quantity INTEGER DEFAULT 100000,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # Tabla de pedidos
        """
        CREATE TABLE IF NOT EXISTS orders (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            service_id UUID REFERENCES services(id),
            target_url VARCHAR(500) NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10,4) NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, cancelled, refunded
            progress INTEGER DEFAULT 0, -- 0-100
            start_count INTEGER DEFAULT 0,
            current_count INTEGER DEFAULT 0,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE,
            estimated_completion TIMESTAMP WITH TIME ZONE
        );
        """,
        
        # Tabla de transacciones/pagos
        """
        CREATE TABLE IF NOT EXISTS transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
            amount DECIMAL(10,2) NOT NULL,
            transaction_type VARCHAR(20) NOT NULL, -- payment, refund, bonus
            payment_method VARCHAR(50), -- card, paypal, crypto, etc
            payment_id VARCHAR(255), -- ID del procesador de pagos
            status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, cancelled
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # Tabla de reembolsos
        """
        CREATE TABLE IF NOT EXISTS refunds (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            reason TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, processed
            admin_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            processed_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        # Tabla de configuración del sistema
        """
        CREATE TABLE IF NOT EXISTS system_config (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            config_key VARCHAR(100) UNIQUE NOT NULL,
            config_value TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # Tabla de logs de actividad
        """
        CREATE TABLE IF NOT EXISTS activity_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            action VARCHAR(100) NOT NULL,
            details JSONB,
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # Tabla de notificaciones
        """
        CREATE TABLE IF NOT EXISTS notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # Índices para optimización
        """
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        """,
        
        # Triggers para actualizar timestamps
        """
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        """,
        
        """
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """,
        
        """
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """,
        
        """
        CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """
    ]
    
    return sql_commands

def insert_initial_data():
    """
    Inserta datos iniciales en la base de datos
    """
    
    # Hash de la contraseña del administrador
    admin_password = "J0rl1ng@dm1n2025!"
    admin_password_hash = hashlib.sha256(admin_password.encode()).hexdigest()
    
    sql_commands = [
        # Insertar usuario administrador
        f"""
        INSERT INTO users (email, password_hash, full_name, is_active, email_verified)
        VALUES ('admin@jorling.com', '{admin_password_hash}', 'Administrador Jorling', TRUE, TRUE)
        ON CONFLICT (email) DO NOTHING;
        """,
        
        # Insertar servicios de Instagram
        """
        INSERT INTO services (name, platform, service_type, price_per_unit, min_quantity, max_quantity, description)
        VALUES 
        ('Seguidores Instagram', 'instagram', 'followers', 0.01, 100, 50000, 'Seguidores reales para tu cuenta de Instagram'),
        ('Likes Instagram', 'instagram', 'likes', 0.02, 50, 10000, 'Likes en tus publicaciones de Instagram'),
        ('Comentarios Instagram', 'instagram', 'comments', 0.02, 10, 1000, 'Comentarios personalizados en tus posts'),
        ('Vistas Instagram Reels', 'instagram', 'views', 0.02, 100, 100000, 'Vistas para tus reels de Instagram')
        ON CONFLICT DO NOTHING;
        """,
        
        # Insertar servicios de Facebook
        """
        INSERT INTO services (name, platform, service_type, price_per_unit, min_quantity, max_quantity, description)
        VALUES 
        ('Seguidores Facebook', 'facebook', 'followers', 0.01, 100, 50000, 'Seguidores para tu página de Facebook'),
        ('Likes Facebook', 'facebook', 'likes', 0.02, 50, 10000, 'Likes en tus publicaciones de Facebook'),
        ('Comentarios Facebook', 'facebook', 'comments', 0.02, 10, 1000, 'Comentarios en tus posts de Facebook'),
        ('Vistas Videos Facebook', 'facebook', 'views', 0.02, 100, 100000, 'Vistas para tus videos de Facebook')
        ON CONFLICT DO NOTHING;
        """,
        
        # Insertar servicios de YouTube
        """
        INSERT INTO services (name, platform, service_type, price_per_unit, min_quantity, max_quantity, description)
        VALUES 
        ('Suscriptores YouTube', 'youtube', 'subscribers', 0.01, 100, 50000, 'Suscriptores reales para tu canal'),
        ('Likes YouTube', 'youtube', 'likes', 0.02, 50, 10000, 'Likes en tus videos de YouTube'),
        ('Comentarios YouTube', 'youtube', 'comments', 0.02, 10, 1000, 'Comentarios en tus videos'),
        ('Vistas YouTube', 'youtube', 'views', 0.02, 100, 1000000, 'Vistas para tus videos'),
        ('Horas de Reproducción YouTube', 'youtube', 'watch_time', 30.00, 500, 10000, 'Horas de reproducción para monetización (500 horas = $15)')
        ON CONFLICT DO NOTHING;
        """,
        
        # Insertar servicios de Twitter/X
        """
        INSERT INTO services (name, platform, service_type, price_per_unit, min_quantity, max_quantity, description)
        VALUES 
        ('Seguidores Twitter/X', 'twitter', 'followers', 0.01, 100, 50000, 'Seguidores para tu cuenta de Twitter/X'),
        ('Likes Twitter/X', 'twitter', 'likes', 0.02, 50, 10000, 'Likes en tus tweets'),
        ('Retweets', 'twitter', 'retweets', 0.02, 25, 5000, 'Retweets para amplificar tus tweets'),
        ('Comentarios Twitter/X', 'twitter', 'comments', 0.02, 10, 1000, 'Comentarios en tus tweets')
        ON CONFLICT DO NOTHING;
        """,
        
        # Insertar configuración del sistema
        """
        INSERT INTO system_config (config_key, config_value, description)
        VALUES 
        ('site_name', 'Jorling Seguidores', 'Nombre del sitio web'),
        ('contact_email', 'contacto@jorling.com', 'Email de contacto principal'),
        ('contact_phone', '+573234135603', 'Teléfono principal'),
        ('contact_phone_alt', '+573150233701', 'Teléfono alternativo'),
        ('telegram_username', '@Jorlingseguidores', 'Usuario de Telegram'),
        ('instagram_url', 'https://www.instagram.com/jorlingjoseseguidores/', 'URL de Instagram'),
        ('min_order_amount', '1.00', 'Monto mínimo de pedido'),
        ('max_order_amount', '10000.00', 'Monto máximo de pedido'),
        ('auto_process_orders', 'true', 'Procesar pedidos automáticamente'),
        ('maintenance_mode', 'false', 'Modo de mantenimiento')
        ON CONFLICT (config_key) DO NOTHING;
        """
    ]
    
    return sql_commands

def create_security_policies():
    """
    Crea políticas de seguridad RLS (Row Level Security) para Supabase
    """
    
    sql_commands = [
        # Habilitar RLS en todas las tablas
        "ALTER TABLE users ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE orders ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;",
        
        # Políticas para usuarios (solo pueden ver sus propios datos)
        """
        CREATE POLICY "Users can view own profile" ON users
            FOR SELECT USING (auth.uid()::text = id::text);
        """,
        
        """
        CREATE POLICY "Users can update own profile" ON users
            FOR UPDATE USING (auth.uid()::text = id::text);
        """,
        
        # Políticas para pedidos
        """
        CREATE POLICY "Users can view own orders" ON orders
            FOR SELECT USING (auth.uid()::text = user_id::text);
        """,
        
        """
        CREATE POLICY "Users can create orders" ON orders
            FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
        """,
        
        # Políticas para transacciones
        """
        CREATE POLICY "Users can view own transactions" ON transactions
            FOR SELECT USING (auth.uid()::text = user_id::text);
        """,
        
        # Políticas para notificaciones
        """
        CREATE POLICY "Users can view own notifications" ON notifications
            FOR SELECT USING (auth.uid()::text = user_id::text);
        """,
