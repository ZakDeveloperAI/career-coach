-- Categorie e skill di base
INSERT INTO categories (name, slug) VALUES
    ('Software Development', 'software-development'),
    ('Data Science',         'data-science'),
    ('Design',               'design'),
    ('Marketing',            'marketing'),
    ('Sales',                'sales'),
    ('HR',                   'hr'),
    ('Finance',              'finance'),
    ('Operations',           'operations'),
    ('Customer Service',     'customer-service'),
    ('Product',              'product');

INSERT INTO skills (name) VALUES
    ('Java'), ('Spring'), ('Spring Boot'), ('Hibernate'), ('PostgreSQL'),
    ('JavaScript'), ('TypeScript'), ('React'), ('Vue'), ('Angular'),
    ('Node.js'), ('Python'), ('Django'), ('SQL'), ('MongoDB'),
    ('Docker'), ('Kubernetes'), ('AWS'), ('Azure'), ('Git'),
    ('REST API'), ('GraphQL'), ('HTML'), ('CSS'), ('Tailwind'),
    ('Figma'), ('Communication'), ('Teamwork'), ('Agile'), ('Scrum');
